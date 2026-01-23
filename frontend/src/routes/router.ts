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
import PdfPage from "../pages/PdfPage.vue";
import NotePage from "../pages/NotePage.vue";
import ClassesPage from "../pages/ClassesPage.vue";
import LecturesPage from "../pages/LecturesPage.vue";
import NotebooksView from "../views/NotebooksView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    components: {
      left: PdfPage,
      right: NotePage,
    },
    props: {
      left: { preview: false },
    },
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
    components: {
      left: ClassesPage,
      right: LecturesPage,
    },
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
