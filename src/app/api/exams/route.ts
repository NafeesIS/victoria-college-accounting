import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import Exam from "../../../models/Exam";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const examCategory = searchParams.get("examCategory") || "";
    const year = searchParams.get("year") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { softDeleted: false };

    if (search) {
      query.$or = [
        { examName: { $regex: search, $options: "i" } },
        { year: isNaN(parseInt(search)) ? undefined : parseInt(search) },
      ].filter(
        (condition) => condition.year !== undefined || condition.examName
      );
    }

    if (examCategory && examCategory !== "all") {
      query.examCategory = examCategory;
    }

    if (year && year !== "all") {
      query.year = parseInt(year);
    }

    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      Exam.find(query)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      Exam.countDocuments(query),
    ]);

    return NextResponse.json({
      exams,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
        limit,
      },
    });
  } catch (error) {
    console.error("Get exams error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      year,
      examCategory,
      examName,
      thisCollegeCount,
      thisCollegeRate,
      otherCollegeCount,
      otherCollegeRate,
      expenses,
      distribution,
    } = await request.json();

    // ✅ Validation
    if (!year || !examCategory || !examName) {
      return NextResponse.json(
        { error: "Required fields: year, examCategory, examName" },
        { status: 400 }
      );
    }

    if (
      thisCollegeCount === undefined ||
      thisCollegeRate === undefined ||
      otherCollegeCount === undefined ||
      otherCollegeRate === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Required fields: thisCollegeCount, thisCollegeRate, otherCollegeCount, otherCollegeRate",
        },
        { status: 400 }
      );
    }

    const totalStudents = Number(thisCollegeCount) + Number(otherCollegeCount);
    if (totalStudents < 1) {
      return NextResponse.json(
        { error: "Total students must be at least 1" },
        { status: 400 }
      );
    }

    if (thisCollegeRate < 0 || otherCollegeRate < 0) {
      return NextResponse.json(
        { error: "Rates per student cannot be negative" },
        { status: 400 }
      );
    }

    // ✅ Distribution validation
    const totalPercent =
      distribution.govtTreasury.percent +
      distribution.teachersCouncil.percent +
      distribution.staffInvigilators.percent +
      distribution.adminCommittee.percent;

    if (Math.abs(totalPercent - 100) > 0.01) {
      return NextResponse.json(
        { error: "Distribution percentages must sum to exactly 100%" },
        { status: 400 }
      );
    }

    // ✅ Calculations
    const incomeAmount =
      thisCollegeCount * thisCollegeRate + otherCollegeCount * otherCollegeRate;
    const totalIncome = incomeAmount;

    const examManagement = expenses.examManagement || 0;
    const distributableFund = totalIncome - examManagement;

    if (distributableFund < 0) {
      return NextResponse.json(
        { error: "Exam management expense cannot exceed total income" },
        { status: 400 }
      );
    }

    // ✅ Calculate distribution amounts from distributable fund
    function toFixedNumber(value: number, decimals = 2): number {
      return Number(value.toFixed(decimals));
    }

    const calculatedDistribution = {
      govtTreasury: {
        percent: distribution.govtTreasury.percent,
        amount: toFixedNumber(
          (distribution.govtTreasury.percent / 100) * distributableFund
        ),
      },
      teachersCouncil: {
        percent: distribution.teachersCouncil.percent,
        amount: toFixedNumber(
          (distribution.teachersCouncil.percent / 100) * distributableFund
        ),
      },
      staffInvigilators: {
        percent: distribution.staffInvigilators.percent,
        amount: toFixedNumber(
          (distribution.staffInvigilators.percent / 100) * distributableFund
        ),
      },
      adminCommittee: {
        percent: distribution.adminCommittee.percent,
        amount: toFixedNumber(
          (distribution.adminCommittee.percent / 100) * distributableFund
        ),
      },
    };

    console.log({ calculatedDistribution });
    // ✅ Sum of distribution amounts = distributable expense
    const distributableExpense = Object.values(calculatedDistribution).reduce(
      (sum, d) => sum + d.amount,
      0
    );

    const totalExpenses = examManagement + distributableExpense;
    console.log({ examManagement });
    console.log({ distributableExpense });
    console.log({ totalExpenses });
    console.log({ totalIncome });
    if (totalExpenses > totalIncome) {
      return NextResponse.json(
        { error: "Total expenses cannot exceed total income" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log({
      year,
      examCategory,
      examName,
      thisCollegeCount,
      thisCollegeRate,
      otherCollegeCount,
      otherCollegeRate,
      totalStudents,
      incomeAmount,
      expenses: {
        examManagement,
        distributable: distributableExpense,
      },
      totalIncome,
      totalExpenses,
      distributableFund,
      distribution: calculatedDistribution,
      createdBy: session.user.id,
    });
    const exam = await Exam.create({
      year,
      examCategory,
      examName,
      thisCollegeCount,
      thisCollegeRate,
      otherCollegeCount,
      otherCollegeRate,
      totalStudents,
      incomeAmount,
      expenses: {
        examManagement,
        distributable: distributableExpense,
      },
      totalIncome,
      totalExpenses,
      distributableFund,
      distribution: calculatedDistribution,
      createdBy: session.user.id,
    });

    const populatedExam = await Exam.findById(exam._id).populate(
      "createdBy",
      "name email"
    );

    return NextResponse.json(populatedExam, { status: 201 });
  } catch (error) {
    console.error("Create exam error:", error);
    if (
      error instanceof Error &&
      error.message.includes("Distribution percentages")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
