import { Store } from 'vuex';

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

export function FireTowerPlugin(store: Store<any>) {
  try {
    const buildTower = () => {
      const endpoint = import.meta.env.VITE_API_V1_WS_URL;
      if (!endpoint) {
        console.warn('firetower not allowed');
        return;
      }
      const tower = new FireTower(
        import.meta.env.VITE_API_V1_WS_URL,
        () => {
          console.log('connected');
          tower.subscribe([
            '/task/status',
            '/workflow/status',
            '/workflow/task/status',
          ]);
          tower.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            const data = msg.data;
            if (data.topic === '/task/status') {
              const v = data.data;
              store.commit('emitEventTask', {
                event: {
                  status: v.status,
                  taskId: v.task_id,
                  projectId: v.project_id,
                },
              });
            } else if (data.topic === '/workflow/status') {
              const v = data.data;
              store.commit('emitEventWorkFlow', {
                event: {
                  status: v.status,
                  workFlowId: v.workflow_id,
                },
              });
            } else if (data.topic === '/workflow/task/status') {
              const v = data.data;
              store.commit('emitEventWorkFlowTask', {
                event: {
                  status: v.status,
                  taskId: v.task_id,
                  projectId: v.project_id,
                  workFlowId: v.workflow_id,
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
