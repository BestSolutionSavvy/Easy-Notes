import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "../stores/auth";
import NotFound from "../pages/NotFound.vue";
import LogoPage from "../pages/LogoPage.vue";
import SigninPage from "../pages/SigninPage.vue";
import SignupPage from "../pages/SignupPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import NotebooksView from "../views/NotebooksView.vue";
import ClassesView from "../views/ClassesView.vue";
import HomeView from "../views/HomeView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { requiresAuth: true },
    props: (route) => ({
      notebookId: route.query.notebookId as string | undefined,
      subject: route.query.subject as string | undefined,
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
  },
  {
    path: "/signin",
    components: {
      left: LogoPage,
      right: SigninPage,
    },
  },
  {
    path: "/signup",
    components: {
      left: LogoPage,
      right: SignupPage,
    },
  },
  {
    path: "/profile",
    components: {
      left: LogoPage,
      right: ProfilePage,
    },
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
    components: {
      left: LogoPage,
      right: NotFound,
    },
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
      next();
    }
  } else {
    next();
  }
});

export default router;
