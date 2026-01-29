import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "../stores/auth";
import SigninView from "../views/SigninView.vue";
import SignupView from "../views/SignupView.vue";
import NotebooksView from "../views/NotebooksView.vue";
import ClassesView from "../views/ClassesView.vue";
import HomeView from "../views/HomeView.vue";
import ProfileView from "../views/ProfileView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
    props: (route) => ({
      notebookId: route.query.notebookId as string | undefined,
      subject: route.query.subject as string | undefined,
      pdfId: route.query.pdfId as string | undefined,
    }),
  },
  {
    path: "/home",
    redirect: "/",
  },
  {
    path: "/notebooks",
    name: "Notebooks",
    component: NotebooksView,
    meta: { requiresAuth: true },
    props: (route) => ({
      summaryId: route.query.summaryId as string | undefined,
    }),
  },
  {
    path: "/signin",
    name: "Signin",
    component: SigninView,
  },
  {
    path: "/signup",
    name: "Signup",
    component: SignupView,
  },
  {
    path: "/profile",
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: "/classes",
    name: "Classes",
    component: ClassesView,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    const isValid = await authStore.verifyToken();
    if (!isValid) {
      next("/signin");
    } else {
      if (
        authStore.user?.role === "teacher" &&
        (to.path === "/" || to.path === "/home")
      ) {
        next("/classes");
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
