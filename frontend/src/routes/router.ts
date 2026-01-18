import { createRouter, createWebHistory } from 'vue-router';
import NotFound from '../pages/NotFound.vue';
import LogoPage from '../pages/LogoPage.vue';
import LoginPage from '../pages/LoginPage.vue';
import SignupPage from '../pages/SignupPage.vue';

const routes = [
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