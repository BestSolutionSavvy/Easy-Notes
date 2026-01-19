import { createRouter, createWebHistory } from 'vue-router';
import NotFound from '../pages/NotFound.vue';
import LogoPage from '../pages/LogoPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import SignupPage from '../pages/SignupPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import ClassesPage from '../pages/ClassesPage.vue';
import LecturesPage from '../pages/LecturesPage.vue';
import NotesPage from '../pages/NotesListPage.vue';
import SlidesPage from '../pages/SlidesPage.vue';

const routes = [
    {
        path: '/notes',
        components: {
            left: NotesPage,
            right: SlidesPage
        }
    },
    {
        path: '/login',
        components: {
            left: LogoPage,
            right: LoginPage
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