import express from "express";
import LeaveRequest from "../models/LeaveRequest.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 👨‍💼 المدير يرى جميع الطلبات
router.get("/admin", auth("admin"), async (req, res) => {
  const requests = await LeaveRequest.find()
    .populate("user_id", "name department")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// ✅ موافقة
router.put("/:id/approve", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "approved", decided_by: req.user.id },
    { new: true }
  );
  res.json(updated);
});

// ❌ رفض
router.put("/:id/reject", auth("admin"), async (req, res) => {
  const updated = await LeaveRequest.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", decided_by: req.user.id },
    { new: true }
  );
  res.json(updated);
});

export default router;
// 🧑‍💼 المستخدم يرى طلباته