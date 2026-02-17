import express from "express"
import Poll from "../models/Poll.js";
import io from "../index.js";


const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });

        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch polls" });
    }
});


// GET /api/polls/:id -> fetch a poll by id (share link access)
router.get("/:id", async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        // Edge Case: Poll not found
        if (!poll) {
            return res.status(404).json({
                message: "Poll not found!",
            });
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({
            message: "Invalid Poll ID or Server Error",
        });
    }
});

// POST /api/polls/create -> new poll with question + options
router.post("/create", async (req, res) => {
    try {
        const { question, options } = req.body;

        // Edge Case: Missing fields
        if (!question || !options) {
            return res.status(400).json({
                message: "Question and options are required",
            });
        }

        // Edge Case: Minimum 2 options required
        if (options.length < 2) {
            return res.status(400).json({
                message: "At least 2 options are required",
            });
        }

        // Format options into DB structure
        const formattedOptions = options.map((opt) => ({
            text: opt,
            votes: 0,
        }));

        // Create poll in MongoDB
        const newPoll = await Poll.create({
            question,
            options: formattedOptions,
        });

        res.status(201).json({
            message: "Poll created successfully ✅",
            pollId: newPoll._id,
            shareLink: `/poll/${newPoll._id}`,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error ❌",
            error: error.message,
        });
    }
});


//    POST /api/polls/vote/:id -> vote for one option
router.post("/vote/:id", async (req, res) => {
    try {
        const { optionIndex, voterId } = req.body;
        const userIp = req.headers["x-forwarded-for"].split(',')[0] || req.socket.remoteAddress;
        // console.log(userIp);

        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({
                message: "Poll not found!",
            });
        }

        // Fairness Mechanism 1: Prevent repeat voting
        // voterId will come from frontend localStorage
        if (!poll.voters) poll.voters = [];

        if (poll.voters.includes(voterId)) {
            return res.status(403).json({
                message: "You have already voted!",
            });
        }
        // Fairness Mechanism 2: Prevent voting from same IP
        if (poll.ipVoters.includes(userIp)) {
            return res.status(403).json({
                message: "Vote already submitted from this network ⚠️",
            });
        }

        // Increase vote count
        poll.options[optionIndex].votes += 1;

        // Store voterid & voterIp
        poll.voters.push(voterId);
        poll.ipVoters.push(userIp);


        await poll.save();
        io.to(req.params.id).emit("pollUpdated", poll);

        res.json({
            message: "Vote submitted successfully!",
            poll,
        });
    } catch (error) {
        res.status(500).json({
            message: "Voting failed!",
            error: error.message,
        });
    }
});


export default router;
