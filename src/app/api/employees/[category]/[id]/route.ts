/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import dbConnect from "../../../../../lib/mongodb";
import Employee from "../../../../../models/Employee";
import { employeeCategories } from "@/contants";

// ================================
// GET /api/employees/[category]/[id]
// ================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ category: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, id } = await context.params;

    if (!employeeCategories[category]) {
      return NextResponse.json(
        { error: "Invalid employee category" },
        { status: 400 }
      );
    }

    await dbConnect();

    const employee = await Employee.findOne({
      _id: id,
      category,
      softDeleted: false,
    })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ================================
// PUT /api/employees/[category]/[id]
// ================================
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ category: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, id } = await context.params;

    if (!employeeCategories[category]) {
      return NextResponse.json(
        { error: "Invalid employee category" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const categoryConfig = employeeCategories[category];

    // Validate required fields
    const missingFields = categoryConfig.fields
      .filter((field) => field.required && !body[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for duplicate unique fields (excluding current record)
    const uniqueFields = categoryConfig.fields.filter((f) => f.unique);
    for (const field of uniqueFields) {
      if (body[field.name]) {
        const existing = await Employee.findOne({
          category,
          [field.name]: body[field.name],
          _id: { $ne: id },
          softDeleted: false,
        });

        if (existing) {
          return NextResponse.json(
            { error: `${field.label} already exists for another employee` },
            { status: 400 }
          );
        }
      }
    }

    // Build update data
    const updateData: any = {
      updatedBy: session.user.id,
    };

    categoryConfig.fields.forEach((field:any) => {
      if (body[field.name] !== undefined) {
        updateData[field.name] = body[field.name];
      }
    });

    const employee = await Employee.findOneAndUpdate(
      { _id: id, category, softDeleted: false },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error("Update employee error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ================================
// DELETE /api/employees/[category]/[id] (soft delete)
// ================================
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ category: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, id } = await context.params;

    if (!employeeCategories[category]) {
      return NextResponse.json(
        { error: "Invalid employee category" },
        { status: 400 }
      );
    }

    await dbConnect();

    const employee = await Employee.findOneAndUpdate(
      { _id: id, category, softDeleted: false },
      {
        softDeleted: true,
        updatedBy: session.user.id,
      },
      { new: true }
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}