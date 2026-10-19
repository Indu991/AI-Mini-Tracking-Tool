import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Issue = sequelize.define(
    "Issue",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: "created_by",
            references: {
                model: "users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },

        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(
                "Open",
                "In Progress",
                "Resolved",
                "Closed"
            ),
            allowNull: false,
            defaultValue: "Open",
        },
        priority: {
            type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
            allowNull: false,
            defaultValue: "Medium",
        },
    },
    {
        tableName: "issues",
        timestamps: true,
    }
);

export default Issue;