import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import NotFound from '../pages/NotFound.vue';
import LogoPage from '../pages/LogoPage.vue';
import SigninPage from '../pages/SigninPage.vue';
import SignupPage from '../pages/SignupPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import PdfPage from '../pages/PdfPage.vue';
import NotePage from '../pages/NotePage.vue';
import ClassesPage from '../pages/ClassesPage.vue';
import LecturesPage from '../pages/LecturesPage.vue';
import NotesPage from '../pages/NotesListPage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        components: {
            left: PdfPage,
            right: NotePage
        },
        props: {
            left: { id: 0 }
        }
    },
    {
        path: '/notes',
        components: {
            left: NotesPage,
            right: PdfPage
        },
        props: {
            right: { id: 0, toolBar: false }
        }
    },
    {
        path: '/signin',
        components: {
            left: LogoPage,
            right: SigninPage
        }
    },
    {
        path: '/signup',
        components: {
            left: LogoPage,
            right: SignupPage
        }
    },
    {
        path: '/profile',
        components: {
            left: LogoPage,
            right: ProfilePage
        }
    },
    {
        path: '/classes',
        components: {
            left: ClassesPage,
            right: LecturesPage
        }
    },
    { 
      path: '/:pathMatch(.*)*', 
      components: {
        left: LogoPage,
        right: NotFound
      }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;