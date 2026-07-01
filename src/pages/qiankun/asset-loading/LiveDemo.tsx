import React, { useState, useMemo } from 'react';
import { Card, Input, Switch, Typography, Space, Collapse, List, Tag, Tooltip, Divider } from 'antd';
import { liveDemoData } from './data';

const LiveDemo: React.FC = () => {
  const [deployPath, setDeployPath] = useState(liveDemoData.inputs[0].defaultValue);
  const [workerName, setWorkerName] = useState(liveDemoData.inputs[1].defaultValue);
  const [qiankunEntry, setQiankunEntry] = useState(false);
  const [nginxForward, setNginxForward] = useState(false);
  const [publicPath, setPublicPath] = useState(false);
  const [getWorkerUrl, setGetWorkerUrl] = useState(false);

  const normalizePath = (path: string) => {
    if (!path.startsWith('/') && !path.startsWith('http')) {
      return '/' + path;
    }
    return path;
  };

  const buildUrl = (base: string, file: string) => {
    const normalized = normalizePath(base).replace(/\/$/, '');
    return `${normalized}/${file}`;
  };

  const standaloneUrl = useMemo(() => {
    return buildUrl(deployPath, workerName);
  }, [deployPath, workerName]);

  const qiankunUrl = useMemo(() => {
    let base = deployPath;
    if (qiankunEntry && !publicPath) {
      // 未设置 __webpack_public_path__，浏览器以主应用路径为 base
      base = '/dashboard';
    }
    if (qiankunEntry && publicPath && !getWorkerUrl) {
      // 设置了 publicPath，但 worker 不走 publicPath
      base = '/dashboard';
    }
    if (qiankunEntry && getWorkerUrl) {
      // 配置了 getWorkerUrl，worker 路径正确
      base = deployPath;
    }
    return buildUrl(base, workerName);
  }, [deployPath, workerName, qiankunEntry, publicPath, getWorkerUrl]);

  const nginxUrl = useMemo(() => {
    let base = deployPath;
    if (nginxForward && !publicPath) {
      // nginx 会把 /sql/ 下请求转发到子应用真实路径；
      // 即使未设置 __webpack_public_path__，Monaco 默认按当前页面 /sql/ 请求 worker，
      // nginx 也会正确转发，因此路径仍然命中子应用。
      base = deployPath;
    }
    if (nginxForward && publicPath) {
      base = deployPath;
    }
    return buildUrl(base, workerName);
  }, [deployPath, workerName, nginxForward, publicPath]);

  const isHit = (url: string) => {
    return url.startsWith(normalizePath(deployPath));
  };

  return (
    <Card title={liveDemoData.title}>
      <Typography.Paragraph>{liveDemoData.description}</Typography.Paragraph>

      <Divider />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Text strong>{liveDemoData.inputs[0].label}：</Typography.Text>
          <Tooltip title="例如 /sql/ 或 https://sql.example.com/sql/">
            <Input
              value={deployPath}
              onChange={(e) => setDeployPath(e.target.value)}
              placeholder="/sql/"
            />
          </Tooltip>
        </div>
        <div>
          <Typography.Text strong>{liveDemoData.inputs[1].label}：</Typography.Text>
          <Tooltip title="例如 editor.worker.js 或 sql.worker.js">
            <Input
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              placeholder="editor.worker.js"
            />
          </Tooltip>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span>启用 <strong>qiankun HTML Entry</strong></span>
            <Tooltip title="模拟子应用被 qiankun 嵌入主应用，页面 base 变为主应用路径">
              <Tag color="blue">?</Tag>
            </Tooltip>
          </Space>
          <Switch checked={qiankunEntry} onChange={setQiankunEntry} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span>启用 <strong>nginx</strong> 相对路径转发</span>
            <Tooltip title="模拟浏览器地址为 /sql/，nginx 转发到子应用真实路径">
              <Tag color="blue">?</Tag>
            </Tooltip>
          </Space>
          <Switch checked={nginxForward} onChange={setNginxForward} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span>运行时设置 <code>__webpack_public_path__</code></span>
            <Tooltip title="影响主线程 webpack chunk 加载，不影响原生 Worker">
              <Tag color="blue">?</Tag>
            </Tooltip>
          </Space>
          <Switch checked={publicPath} onChange={setPublicPath} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <span>配置 <code>MonacoEnvironment.getWorkerUrl</code></span>
            <Tooltip title="显式指定 Worker 绝对 URL，强制 Monaco 正确加载 worker">
              <Tag color="blue">?</Tag>
            </Tooltip>
          </Space>
          <Switch checked={getWorkerUrl} onChange={setGetWorkerUrl} />
        </div>
      </Space>

      <Divider />

      <Collapse>
        {liveDemoData.scenarios.map((scenario) => {
          let url = standaloneUrl;
          if (scenario.key === 'qiankun') url = qiankunUrl;
          if (scenario.key === 'nginx') url = nginxUrl;
          const hit = isHit(url);
          return (
            <Collapse.Panel
              header={
                <Space>
                  <span>{scenario.label}</span>
                  <Tag color={hit ? 'success' : 'error'}>{hit ? '命中' : '404'}</Tag>
                </Space>
              }
              key={scenario.key}
            >
              <Typography.Paragraph>
                <strong>请求 URL：</strong>
                <code>{url}</code>
              </Typography.Paragraph>
              <Typography.Paragraph>
                {hit
                  ? '该路径与子应用部署路径一致，资源可以正常加载。'
                  : '该路径偏离子应用部署路径，浏览器会请求到错误位置，导致 404。'}
              </Typography.Paragraph>
            </Collapse.Panel>
          );
        })}
      </Collapse>

      <Collapse style={{ marginTop: 24 }}>
        <Collapse.Panel header={liveDemoData.decisionTreeTitle} key="tree">
          <List
            size="small"
            dataSource={[
              '1. 主资源包 404 → 检查 output.publicPath 或 __webpack_public_path__',
              '2. 语法高亮/命令补全失效 → 检查 Monaco getWorkerUrl 或 CodeMirror modeURL（nginx 转发场景下可能无需修改）',
              '3. 边框/图标/字体丢失 → 检查 CSS 中的 url() 路径',
              '4. nginx 转发场景 → 确认 location /xxx/ 和 proxy_pass 末尾斜杠一致，此时 Monaco 默认 worker 路径通常可直接命中',
              '5. qiankun HTML Entry 场景 → 确认资源使用绝对路径或协议相对 URL，必要时配置 getWorkerUrl',
            ]}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Collapse.Panel>
      </Collapse>
    </Card>
  );
};

export default LiveDemo;
