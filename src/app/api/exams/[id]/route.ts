import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/mongodb";
import Exam from "../../../../models/Exam";

// ================================
// GET /api/exams/[id]
// ================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ fixed

    await dbConnect();

    const exam = await Exam.findOne({ _id: id, softDeleted: false })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Get exam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ================================
// PUT /api/exams/[id]
// ================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ fixed params

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
        { error: "Missing student count / rate fields" },
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
        { error: "Rate per student cannot be negative" },
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
      thisCollegeCount * thisCollegeRate +
      otherCollegeCount * otherCollegeRate;

    const totalIncome = incomeAmount;

    const examManagement = expenses.examManagement || 0;
    const distributableFund = totalIncome - examManagement;

    if (distributableFund < 0) {
      return NextResponse.json(
        { error: "Exam management expense cannot exceed total income" },
        { status: 400 }
      );
    }

    // ✅ Distribution amounts (rounded to 2 decimals)
    const calculatedDistribution = {
      govtTreasury: {
        percent: distribution.govtTreasury.percent,
        amount: Number(
          ((distribution.govtTreasury.percent / 100) * distributableFund).toFixed(2)
        ),
      },
      teachersCouncil: {
        percent: distribution.teachersCouncil.percent,
        amount: Number(
          ((distribution.teachersCouncil.percent / 100) * distributableFund).toFixed(2)
        ),
      },
      staffInvigilators: {
        percent: distribution.staffInvigilators.percent,
        amount: Number(
          ((distribution.staffInvigilators.percent / 100) * distributableFund).toFixed(2)
        ),
      },
      adminCommittee: {
        percent: distribution.adminCommittee.percent,
        amount: Number(
          ((distribution.adminCommittee.percent / 100) * distributableFund).toFixed(2)
        ),
      },
    };

    const distributableExpense = Object.values(calculatedDistribution).reduce(
      (sum, d) => sum + d.amount,
      0
    );

    const totalExpenses = examManagement + distributableExpense;

    if (totalExpenses > totalIncome) {
      return NextResponse.json(
        { error: "Total expenses cannot exceed total income" },
        { status: 400 }
      );
    }

    // ✅ DB update
    await dbConnect();

    const exam = await Exam.findOneAndUpdate(
      { _id: id, softDeleted: false },
      {
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
        updatedBy: session.user.id,
      },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Update exam error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// ================================
// DELETE /api/exams/[id] (soft delete)
// ================================
// ================================
// DELETE /api/exams/[id]
// ================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params; // ✅ FIXED

    await dbConnect();

    const exam = await Exam.findOneAndUpdate(
      { _id: id, softDeleted: false },
      {
        softDeleted: true,
        updatedBy: session.user.id,
      },
      { new: true }
    );

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Delete exam error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

