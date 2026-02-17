import mongoose from "mongoose";


const pollSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
        },

        options: [
            {
                text: { type: String, required: true },
                votes: { type: Number, default: 0 },
            },
        ],

        voters: {
            type: [String],
            default: [],
        },

        ipVoters: {
            type: [String],
            default: [],
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { versionKey: false }
);

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
