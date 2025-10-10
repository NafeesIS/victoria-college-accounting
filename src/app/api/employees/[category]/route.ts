/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import { employeeCategories } from "@/contants";
// import { employeeCategories } from "@/constants/employeeCategories";

// ================================
// GET /api/employees/[category]
// ================================
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category } = await context.params;

    // Validate category
    if (!employeeCategories[category]) {
      return NextResponse.json(
        { error: "Invalid employee category" },
        { status: 400 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: any = { 
      category, 
      softDeleted: false 
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { idNumber: { $regex: search, $options: "i" } },
        { nidNumber: { $regex: search, $options: "i" } },
        { eTin: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ================================
// POST /api/employees/[category]
// ================================
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category } = await context.params;

    // Validate category
    if (!employeeCategories[category]) {
      return NextResponse.json(
        { error: "Invalid employee category" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const categoryConfig = employeeCategories[category];

    // Validate required fields based on category config
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

    // Check for duplicate unique fields
    const uniqueFields = categoryConfig.fields.filter((f) => f.unique);
    for (const field of uniqueFields) {
      if (body[field.name]) {
        const existing = await Employee.findOne({
          category,
          [field.name]: body[field.name],
          softDeleted: false,
        });

        if (existing) {
          return NextResponse.json(
            { error: `${field.label} already exists for this category` },
            { status: 400 }
          );
        }
      }
    }

    // Create employee
    const employeeData: any = {
      category,
      createdBy: session.user.id,
    };

    // Copy all fields from body
    categoryConfig.fields.forEach((field) => {
      if (body[field.name]) {
        employeeData[field.name] = body[field.name];
      }
    });

    const employee = await Employee.create(employeeData);

    const populatedEmployee = await Employee.findById(employee._id)
      .populate("createdBy", "name email");

    return NextResponse.json(populatedEmployee, { status: 201 });
  } catch (error: any) {
    console.error("Create employee error:", error);
    
    // Handle duplicate key errors
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