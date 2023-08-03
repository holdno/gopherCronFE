import { Store } from 'vuex';

import { User } from '@/api/request';

function errorMessage(message: string) {
  return {
    type: 'error',
    info: message,
  };
}

function successMessage(message: string) {
  return {
    type: 'success',
    info: message,
  };
}

export class FireTower {
  ws: WebSocket;

  subscribeKey = 'subscribe';
  unSubscribeKey = 'unSubscribe';
  publishKey = 'publish';
  logging = true; // 开启log

  onmessage?: (event: MessageEvent) => void;

  onclose?: (event: CloseEvent) => void;

  constructor(
    addr: string,
    onopen: () => void,
    onclose: (event: CloseEvent) => void,
  ) {
    this.ws = new WebSocket(addr);
    this.ws.onopen = onopen;
    this.onclose = onclose;

    this.ws.onmessage = (event) => {
      if (this.logging) {
        this.logInfo('new message:' + JSON.stringify(event.data));
      }

      if (event.data === 'heartbeat') {
        return;
      }

      if (this.onmessage) {
        this.onmessage(event);
      }
    };

    this.ws.onclose = (event) => {
      if (this.onclose) {
        this.onclose(event);
      }
    };
  }

  logInfo(data: any) {
    console.log('[FireTower] INFO', data);
  }

  publish(topic: string, data: string) {
    if (topic === '' || data === '') {
      return errorMessage('topic或data参数不能为空');
    }

    if (this.logging) {
      this.logInfo(
        'publish topic:"' + topic + '", data:' + JSON.stringify(data),
      );
    }

    this.ws.send(
      JSON.stringify({
        type: this.publishKey,
        topic: topic,
        data: data,
      }),
    );
    return successMessage('发送成功');
  }

  subscribe(topics: string[] | string) {
    if (!Array.isArray(topics)) {
      topics = [topics];
    }

    if (this.logging) {
      this.logInfo('subscribe:"' + topics.join(',') + '"');
    }

    this.ws.send(
      JSON.stringify({
        type: this.subscribeKey,
        topic: topics.join(','),
        data: '',
      }),
    );
  }

  unsubscribe(topics: string[] | string) {
    if (!Array.isArray(topics)) {
      topics = [topics];
    }

    if (this.logging) {
      this.logInfo('unSubscribe:"' + topics.join(',') + '"');
    }

    this.ws.send(
      JSON.stringify({
        type: this.unSubscribeKey,
        topic: topics.join(','),
        data: '',
      }),
    );
  }
}

export function FireTowerPlugin(user: User, store: Store<any>) {
  try {
    const buildTower = () => {
      let endpoint = import.meta.env.VITE_API_V1_WS_URL;
      if (!endpoint) {
        console.warn('firetower not allowed');
        return;
      }
      if (endpoint.indexOf('?') !== -1) {
        endpoint += '&user=' + user.id;
      } else {
        endpoint += '?user=' + user.id;
      }
      const tower = new FireTower(
        endpoint,
        () => {
          store.commit('setTower', tower);
          console.log('firetower connected');
          // tower.subscribe([
          //   '/task/status',
          //   '/workflow/status',
          //   '/workflow/task/status',
          // ]);
          tower.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            const cloudeventData = msg.data.data;
            if (msg.type !== 'publish') {
              return;
            }
            if (msg.topic.startsWith('/task/status')) {
              store.commit('emitEventTask', {
                event: {
                  status: cloudeventData.status,
                  taskId: cloudeventData.task_id,
                  projectId: cloudeventData.project_id,
                },
              });
            } else if (msg.topic.startsWith('/workflow/status')) {
              store.commit('emitEventWorkFlow', {
                event: {
                  status: cloudeventData.status,
                  workFlowId: cloudeventData.workflow_id,
                },
              });
            } else if (msg.topic.startsWith('/workflow/task/status')) {
              store.commit('emitEventWorkFlowTask', {
                event: {
                  status: cloudeventData.status,
                  taskId: cloudeventData.task_id,
                  projectId: cloudeventData.project_id,
                  workFlowId: cloudeventData.workflow_id,
                },
              });
            } else {
              console.log('unknown event', event);
            }
          };
        },
        () => {
          setTimeout(() => {
            buildTower();
          }, 1000);
        },
      );
    };
    buildTower();
  } catch (e) {
    console.log(e);
  }
}
