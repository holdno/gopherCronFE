import {
  RouteLocationNormalizedLoaded,
  createRouter,
  createWebHashHistory, // createWebHistory,
} from 'vue-router';

import { fetchWorkFlowDetail } from './api/workflow';

import { store } from '@/store/index';

function createBeforeEnter(type: 'crontab' | 'workflow' | 'temporary') {
  return async (to: RouteLocationNormalizedLoaded) => {
    if (type === 'crontab') {
      const projectId = Number(to.params.projectId);
      const tasks = store.state.Task.tasks.get(projectId);
      if (!tasks || tasks.length === 0) {
        await store.dispatch('Task/fetchTasks', { projectId });
      }
      const task = store.state.Task.tasks
        .get(projectId)
        ?.find((v) => v.id === to.params.taskId);
      if (task === undefined) {
        return { name: 'notfound' };
      }
    } else if (type === 'workflow') {
      const projectId = Number(to.params.projectId);
      const tasks = store.state.WorkFlowTask.tasks.get(projectId);
      if (!tasks || tasks.length === 0) {
        await store.dispatch('WorkFlowTask/fetchTasks', {
          projectId: Number(to.params.projectId),
        });
      }
      const task = store.state.WorkFlowTask.tasks
        .get(projectId)
        ?.find((v) => v.id === to.params.taskId);
      if (task === undefined) {
        return { name: 'notfound' };
      }
    } else if (type === 'temporary') {
      const projectId = Number(to.params.projectId);
      const tasks = store.state.Task.temporaryTasks.get(projectId);
      if (!tasks || tasks.length === 0) {
        await store.dispatch('Task/fetchTemporaryTasks', { projectId });
      }
      const task = store.state.Task.temporaryTasks.get(projectId)?.find((v) => {
        return v.id === Number(to.params.taskId);
      });

      if (task === undefined) {
        return { name: 'notfound' };
      }
    }
  };
}
const TaskRoutes = (type: 'crontab' | 'workflow' | 'temporary') => [
  {
    name: `${type}_task`,
    path: 'task/:taskId',
    component: () => import('@/pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      id: route.params.taskId,
      projectId: Number(route.params.projectId),
      type: type,
    }),
    beforeEnter: createBeforeEnter(type),
  },
  {
    name: `${type}_task_logs`,
    path: 'task/:taskId/logs',
    component: () => import('@/pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      id: route.params.taskId,
      projectId: Number(route.params.projectId),
      type: type,
    }),
    beforeEnter: createBeforeEnter(type),
  },
  {
    name: `create_${type}_task`,
    path: 'task/create',
    component: () => import('@/pages/TaskDetail.vue'),
    props: (route: RouteLocationNormalizedLoaded) => ({
      projectId: Number(route.params.projectId),
      type: type,
    }),
  },
];

const routes = [
  {
    path: '/',
    redirect: { name: 'summary', params: { orgId: 'baseorg' } },
    component: () => import('@/layouts/LandingLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        name: 'summary',
        path: ':orgId/summary',
        props: (route: RouteLocationNormalizedLoaded) => ({
          orgId: route.params.orgId,
        }),
        component: () => import('@/pages/Summary/SummaryPage.vue'),
      },
      {
        name: 'projects',
        path: ':orgId/project',
        props: (route: RouteLocationNormalizedLoaded) => ({
          orgId: route.params.orgId,
        }),
        component: () => import('@/pages/ProjectList.vue'),
        children: [
          {
            name: 'project',
            path: ':projectId(\\d+)',
            component: () => import('@/layouts/DummyContainer.vue'),
            async beforeEnter(to: RouteLocationNormalizedLoaded) {
              if (store.state.Project.projects.length === 0) {
                await store.dispatch('Project/fetchProjects', {
                  orgId: to.params.orgId,
                });
              }
              const project = store.state.Project.projects.find(
                (v) => v.id === Number(to.params.projectId),
              );
              if (project === undefined) {
                return { name: 'notfound' };
              }
            },
            redirect: (from: RouteLocationNormalizedLoaded) => ({
              name: 'crontab_tasks',
              params: { ...from.params },
            }),
            children: [
              {
                name: 'crontab_tasks',
                path: 'crontab_tasks',
                component: () => import('@/pages/TaskList.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  projectId: Number(route.params.projectId),
                }),
                children: TaskRoutes('crontab'),
              },
              {
                name: 'temporary_tasks',
                path: 'temporary_tasks',
                component: () => import('@/pages/TaskList.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  projectId: Number(route.params.projectId),
                }),
                children: TaskRoutes('temporary'),
              },
              {
                name: 'workflow_tasks',
                path: 'workflow_tasks',
                component: () => import('@/pages/TaskList.vue'),
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
        path: ':orgId/workflows',
        props: (route: RouteLocationNormalizedLoaded) => ({
          orgId: route.params.orgId,
        }),
        component: () => import('@/pages/WorkflowList.vue'),
        children: [
          {
            name: 'workflow',
            path: ':workflowId(\\d+)',
            component: () => import('@/pages/WorkflowTabs.vue'),
            props: (route: RouteLocationNormalizedLoaded) => ({
              id: Number(route.params.workflowId),
              orgId: route.params.orgId,
            }),
            async beforeEnter(to: RouteLocationNormalizedLoaded) {
              try {
                await fetchWorkFlowDetail(Number(to.params.workflowId));
              } catch (e) {
                return { name: 'notfound' };
              }
            },
            redirect: (from: RouteLocationNormalizedLoaded) => ({
              name: 'workflow_graph',
              params: { ...from.params },
            }),
            children: [
              {
                name: 'workflow_graph',
                path: 'graph',
                component: () => import('@/pages/WorkflowTabs.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  id: Number(route.params.workflowId),
                  orgId: route.params.orgId,
                }),
              },
              {
                name: 'workflow_logs',
                path: 'logs',
                component: () => import('@/pages/WorkflowTabs.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  id: Number(route.params.workflowId),
                  orgId: route.params.orgId,
                }),
              },
              {
                name: 'workflow_detail',
                path: 'detail',
                component: () => import('@/pages/WorkflowTabs.vue'),
                props: (route: RouteLocationNormalizedLoaded) => ({
                  id: Number(route.params.workflowId),
                  orgId: route.params.orgId,
                }),
              },
            ],
          },
          {
            name: 'create_workflow',
            path: 'create',
            component: () => import('@/pages/WorkflowTabs.vue'),
            props: (route: RouteLocationNormalizedLoaded) => ({
              orgId: route.params.orgId,
            }),
          },
        ],
      },
      {
        name: 'user-admin',
        path: 'admin/user',
        component: () => import('@/pages/UserListAdmin/UserListAdmin.vue'),
        meta: { requiresAdmin: true },
      },
      {
        name: 'node-admin',
        path: 'admin/node',
        component: () => import('@/pages/NodeListAdmin/NodeListAdmin.vue'),
        meta: { requiresAdmin: true },
      },
      {
        name: 'user-profile',
        path: 'user/profile',
        component: () => import('@/pages/User/UserProfile.vue'),
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    name: 'logout',
    path: '/logout',
    redirect: { name: 'login' },
  },
  {
    name: 'forbidden',
    path: '/error/forbidden',
    component: () => import('@/pages/HTTPStatus.vue'),
    props: {
      code: 403,
    },
  },
  {
    name: 'notfound',
    path: '/error/notfound',
    component: () => import('@/pages/HTTPStatus.vue'),
    props: {
      code: 404,
    },
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'notfound' } },
];

const Router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes: routes,
});

Router.beforeEach(async (to, from) => {
  await store.dispatch('checkLogin');

  if (to.params.orgId !== from.params.orgId && to.params.orgId) {
    store.commit('setCurrentOrg', to.params.orgId);
  }

  if (to.meta.requiresAuth && !store.state.Root.logined) {
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
