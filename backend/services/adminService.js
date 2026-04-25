import User from "../models/User.js";
import WorkSession from "../models/WorkSession.js";
import Department from "../models/Department.js";

export async function getAdminUsersOverview() {
  return User.aggregate([
    {
      $lookup: {
        from: "worksessions",
        localField: "_id",
        foreignField: "user_id",
        pipeline: [
          { $sort: { start_time: -1 } },
          {
            $project: {
              _id: 1,
              date_today: 1,
              start_time: 1,
              end_time: 1,
              pause: 1,
            },
          },
        ],
        as: "sessions",
      },
    },
    {
      $addFields: {
        sessionCount: { $size: "$sessions" },
        latestSession: { $arrayElemAt: ["$sessions", 0] },
      },
    },
    { $sort: { name: 1 } },
    {
      $project: {
        password_hash: 0,
        sessions: 0,
      },
    },
  ]);
}

export async function getAttendance(user) {
  const query = user.role === "admin" ? {} : { user_id: user.id };

  return WorkSession.find(query)
    .select("user_id start_time end_time date_today pause")
    .populate("user_id", "name role department")
    .sort({ start_time: -1 })
    .lean();
}

export async function getReports() {
  const [departmentsCount, userStats, hoursPerDept] = await Promise.all([
    Department.countDocuments(),
    User.aggregate([
      {
        $facet: {
          totals: [{ $count: "userCount" }],
          byDepartment: [{ $group: { _id: "$department", count: { $sum: 1 } } }],
        },
      },
    ]),
    WorkSession.aggregate([
      { $match: { end_time: { $ne: null } } },
      {
        $project: {
          user_id: 1,
          netMinutes: {
            $max: [
              {
                $subtract: [
                  {
                    $dateDiff: {
                      startDate: "$start_time",
                      endDate: "$end_time",
                      unit: "minute",
                    },
                  },
                  {
                    $add: [
                      {
                        $multiply: [
                          {
                            $convert: {
                              input: { $arrayElemAt: [{ $split: ["$pause", ":"] }, 0] },
                              to: "int",
                              onError: 0,
                              onNull: 0,
                            },
                          },
                          60,
                        ],
                      },
                      {
                        $convert: {
                          input: { $arrayElemAt: [{ $split: ["$pause", ":"] }, 1] },
                          to: "int",
                          onError: 0,
                          onNull: 0,
                        },
                      },
                    ],
                  },
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [{ $project: { department: 1 } }],
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.department",
          totalMinutes: { $sum: "$netMinutes" },
        },
      },
    ]),
  ]);

  const userCount = userStats[0]?.totals[0]?.userCount || 0;
  const usersPerDept = userStats[0]?.byDepartment || [];
  const reportMap = {};
  let totalHoursAll = 0;

  usersPerDept.forEach((entry) => {
    const department = entry._id || "Ohne Abteilung";
    reportMap[department] = { department, count: entry.count, hours: 0 };
  });

  hoursPerDept.forEach((entry) => {
    const department = entry._id || "Ohne Abteilung";
    const hours = entry.totalMinutes / 60;

    if (!reportMap[department]) {
      reportMap[department] = { department, count: 0, hours: 0 };
    }

    reportMap[department].hours = hours;
    totalHoursAll += hours;
  });

  return {
    userCount,
    departments: departmentsCount,
    totalHours: totalHoursAll,
    byDepartment: Object.values(reportMap),
  };
}
