import { createRouter, createWebHistory } from 'vue-router';
import NotFound from '../pages/NotFound.vue';
import LogoPage from '../pages/LogoPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import SignupPage from '../pages/SignupPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';
import PdfPage from '../pages/PdfPage.vue';
import NotePage from '../pages/NotePage.vue';

const routes = [
    {
        path: '/',
        components: {
            left: PdfPage,
            right: NotePage
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