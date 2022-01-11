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

  constructor(addr: string, onopen: () => void) {
    this.ws = new WebSocket(addr);
    this.ws.onopen = onopen;

    this.ws.onmessage = (event) => {
      if (this.logging) {
        this.logInfo('new message:' + JSON.stringify(event.data));
      }

      const data = JSON.parse(event.data);
      if (data.data === 'heartbeat') {
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
  const tower = new FireTower(import.meta.env.VITE_API_V1_WS_URL, () => {
    console.log('connected');
    tower.subscribe([
      '/task/status',
      '/workflow/status',
      '/workflow/task/status',
    ]);
    tower.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.topic === '/task/status') {
        store.commit('emitEventTask', { event: data.data });
      } else if (data.topic === '/workflow/status') {
        store.commit('emitEventWorkFlow', { event: data.data });
      } else if (data.topic === '/workflow/task/status') {
        store.commit('emitEventWorkFlowTask', { event: data.data });
      } else {
        console.log('unknown event', event);
      }
    };
  });
}
