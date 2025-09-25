import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import dbConnect from "../../../lib/mongodb";
import Teacher from "../../../models/Teacher";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { idNumber: { $regex: search, $options: "i" } },
        { nidNumber: { $regex: search, $options: "i" } },
        { eTin: { $regex: search, $options: "i" } },
      ];
    }

    if (department && department !== "all") {
      query.department = department;
    }

    const teachers = await Teacher.find(query)
      .populate("createdBy", "name email")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Get teachers error:", error);
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
      name,
      department,
      bcsBatch,
      idNumber,
      nidNumber,
      eTin,
      type,
      designation,
    } = await request.json();

    if (
      !name ||
      !department ||
      !bcsBatch ||
      !idNumber ||
      !nidNumber ||
      !eTin ||
      !type ||
      !designation
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for duplicate unique fields
    const existingTeacher = await Teacher.findOne({
      $or: [{ idNumber }, { nidNumber }, { eTin }],
    });

    if (existingTeacher) {
      return NextResponse.json(
        {
          error:
            "Teacher with this ID Number, NID Number, or E-TIN already exists",
        },
        { status: 400 }
      );
    }

    const teacher = await Teacher.create({
      name,
      department,
      bcsBatch,
      idNumber,
      nidNumber,
      eTin,
      type,
      designation,
      createdBy: session.user.id,
    });

    const populatedTeacher = await Teacher.findById(teacher._id).populate(
      "createdBy",
      "name email"
    );

    return NextResponse.json(populatedTeacher, { status: 201 });
  } catch (error) {
    console.error("Create teacher error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
