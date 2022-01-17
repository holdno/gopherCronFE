import {
  createWebHistory,
  createRouter,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import { store } from '@/store';

const TaskRoutes = (type: string) => [
  {
    name: `${type}_task`,
    path: 'task/:taskId',
    component: () => import('./pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      id: route.params.taskId,
      projectId: Number(route.params.projectId),
      type: type,
    }),
  },
  {
    name: `${type}_task_logs`,
    path: 'task/:taskId/logs',
    component: () => import('./pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      id: route.params.taskId,
      projectId: Number(route.params.projectId),
      type: type,
    }),
  },
  {
    name: `create_${type}_task`,
    path: 'task/create',
    component: () => import('./pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      projectId: Number(route.params.projectId),
      type: type,
    }),
  },
];

const routes = [
  {
    path: '/',
    redirect: 'summary',
    component: () => import('./layouts/LandingLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'summary',
        path: 'summary',
        component: () => import('./pages/SummaryPage.vue'),
      },
      {
        name: 'projects',
        path: 'project',
        component: () => import('./pages/ProjectList.vue'),
        children: [
          {
            name: 'project',
            path: ':projectId(\\d+)',
            component: () => import('./layouts/DummyContainer.vue'),
            redirect: (from: RouteLocationNormalizedLoaded) => ({
              name: 'crontab_tasks',
              params: { ...from.params },
            }),
            children: [
              {
                name: 'crontab_tasks',
                path: 'crontab_tasks',
                component: () => import('./pages/TaskList.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  projectId: Number(route.params.projectId),
                }),
                children: TaskRoutes('crontab'),
              },
              {
                name: 'workflow_tasks',
                path: 'workflow_tasks',
                component: () => import('./pages/TaskList.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  projectId: Number(route.params.projectId),
                }),
                children: TaskRoutes('workflow'),
              },
            ],
          },
        ],
      },
      {
        name: 'workflows',
        path: 'workflows',
        component: () => import('./pages/WorkflowList.vue'),
        children: [
          {
            name: 'workflow',
            path: ':workflowId(\\d+)',
            component: () => import('./pages/WorkflowDetail.vue'),
            props: (route: RouteLocationNormalizedLoaded) => ({
              id: Number(route.params.workflowId),
            }),
          },
          {
            name: 'workflow_logs',
            path: ':workflowId(\\d+)/logs',
            component: () => import('./pages/WorkFlowLogs.vue'),
            props: (route: RouteLocationNormalizedLoaded) => ({
              id: Number(route.params.workflowId),
            }),
          },
        ],
      },
      {
        name: 'user-admin',
        path: 'admin/user',
        component: () => import('./pages/UserListAdmin/UserListAdmin.vue'),
        meta: { requiresAdmin: true },
      },
      {
        name: 'node-admin',
        path: 'admin/node',
        component: () => import('./pages/NodeListAdmin/NodeListAdmin.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('./pages/Login.vue'),
  },
  {
    name: 'logout',
    path: '/logout',
    redirect: '/login',
  },
  {
    name: 'forbidden',
    path: '/error/forbidden',
    component: () => import('./pages/HTTPStatus.vue'),
    props: {
      code: 403,
    },
  },
  {
    name: 'notfound',
    path: '/error/notfound',
    component: () => import('./pages/HTTPStatus.vue'),
    props: {
      code: 404,
    },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'notfound' } },
];

const Router = createRouter({
  history: createWebHistory(),
  routes,
});

Router.beforeEach(async (to, from) => {
  await store.dispatch('checkLogin');

  if (to.meta.requiresAuth && !store.state.logined) {
    // 此路由需要授权，请检查是否已登录
    // 如果没有，则重定向到登录页面
    return {
      name: 'login',
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.requiresAdmin && !store.getters.isAdmin) {
    return {
      name: 'forbidden',
    };
  }
});

export default Router;
