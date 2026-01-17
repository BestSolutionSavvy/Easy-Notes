import { createRouter, createWebHistory } from 'vue-router';
import NotFound from '../pages/NotFound.vue';
import LogoPage from '../pages/LogoPage.vue';

const routes = [
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