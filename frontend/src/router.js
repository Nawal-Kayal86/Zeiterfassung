import { createRouter, createWebHistory } from "vue-router";
import Layout from "./components/Layout.vue";

import Presentation from "./views/Presentation.vue";
import Presentation01 from "./views/Presentation01.vue";
import Presentation02 from "./views/Presentation02.vue";
import Presentation03 from "./views/Presentation03.vue";
import Presentation04 from "./views/Presentation04.vue";
import Presentation05 from "./views/Presentation05.vue";
import Presentation06 from "./views/Presentation06.vue";


import Dashboard from "./views/Dashboard.vue";
import Login from "./views/Login.vue";
import Admin from "./views/Admin.vue";
import Billing from "./views/Billing.vue";
import NewUser from "./views/NewUser.vue";
import Kalender from "./views/Calendar.vue";
import Errors from "./views/Errors.vue";
import Terminal from "./views/Terminal.vue";
import Workflow from "./views/Workflow.vue";
import Schedule from "./views/Schedule.vue";
import Reports from "./views/Reports.vue";
import Departments from "./views/DepartmentsAdmin.vue";
import Config from "./views/Config.vue";
import WorkSchedule from "./views/WorkSchedule.vue";
import LeaveRequest from "./views/LeaveRequest.vue";
import LeaveApproval from "./views/LeaveApproval.vue";
import { getStoredToken, getStoredUser, isStoredTokenExpired, useAuth } from "./composables/useAuth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/presentation",
    component: Presentation,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation01",
    component: Presentation01,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation02",
    component: Presentation02,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation03",
    component: Presentation03,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation04",
    component: Presentation04,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation05",
    component: Presentation05,
    meta: { title: "Projektpraesentation" },
  },
    {
    path: "/presentation06",
    component: Presentation06,
    meta: { title: "Projektpraesentation" },
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        component: Dashboard,
        meta: { title: "Dashboard", icon: "bi-clock-history" },
      },
      {
        path: "admin",
        component: Admin,
        meta: { title: "Admin", icon: "bi-person-badge-fill" },
      },
      {
        path: "billing",
        component: Billing,
        meta: { title: "Abrechnungsliste", icon: "bi-receipt-cutoff" },
      },
      {
        path: "newuser",
        component: NewUser,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "User-Verwaltung",
          icon: "bi-people-fill",
        },
      },
      {
        path: "kalender",
        component: Kalender,
        meta: { title: "Kalender", icon: "bi-calendar3-event-fill" },
      },
      {
        path: "errors",
        component: Errors,
        meta: {
          title: "Fehlerprotokoll",
          icon: "bi-exclamation-triangle-fill",
        },
      },
      {
        path: "terminal",
        component: Terminal,
        meta: { title: "Terminal", icon: "bi-pc-display-horizontal" },
      },
      {
        path: "workflow",
        component: Workflow,
        meta: { title: "Arzttermine", icon: "bi-hospital" },
      },
      {
        path: "leave-request",
        component: LeaveRequest,
        meta: { title: "Urlaubsantrag", icon: "bi-sun-fill" },
      },
      {
        path: "leave-approval",
        component: LeaveApproval,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Urlaubsfreigabe",
          icon: "bi-clipboard2-check",
        },
      },
      {
        path: "schedule",
        component: Schedule,
        meta: { title: "Dienstplan", icon: "bi-calendar-date-fill" },
      },
      {
        path: "reports",
        component: Reports,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Berichte",
          icon: "bi-graph-up-arrow",
        },
      },
      {
        path: "departments",
        component: Departments,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Abteilungen",
          icon: "bi-building-fill",
        },
      },
      {
        path: "config",
        component: Config,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Feiertage & Ferien",
          icon: "bi-calendar-range",
        },
      },
      {
        path: "work-schedule",
        component: WorkSchedule,
        meta: {
          requiresAuth: true,
          requiresAdmin: true,
          title: "Sollarbeitszeiten",
          icon: "bi-clock-fill",
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { logout } = useAuth();
  const token = getStoredToken();
  const user = getStoredUser();

  if (to.path === "/login" && token && !isStoredTokenExpired(token)) {
    return next("/dashboard");
  }

  if (to.meta.requiresAuth) {
    if (!token) return next("/login");

    if (isStoredTokenExpired(token)) {
      logout();
      return next("/login");
    }

    if (to.meta.requiresAdmin && user?.role !== "admin") {
      return next("/dashboard");
    }
  }

  next();
});

export default router;
