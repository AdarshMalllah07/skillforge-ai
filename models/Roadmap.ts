import { Schema, model, models } from "mongoose";

const RoadmapSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner",
        },

        progress: {
            type: Number,
            default: 0,
        },

        aiRoadmap: {
            type: String,
            default: "",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export default models.Roadmap || model("Roadmap", RoadmapSchema);