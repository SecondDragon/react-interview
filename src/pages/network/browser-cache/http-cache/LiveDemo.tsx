import React, { useMemo, useState } from 'react';
import { Card, Radio, Select, Space, Steps, Tag, Typography } from 'antd';

const { Option } = Select;

interface CacheResult {
  status: string;
  fromCache: string;
  requestSent: boolean;
  explanation: string;
}

const HttpCacheLiveDemo: React.FC = () => {
  const [cacheControl, setCacheControl] = useState<string>('max-age=3600');
  const [etag, setEtag] = useState<string>('present');
  const [lastModified, setLastModified] = useState<string>('present');
  const [action, setAction] = useState<string>('normal');

  const result = useMemo<CacheResult>(() => {
    if (action === 'force') {
      return {
        status: '200（强制刷新）',
        fromCache: '无',
        requestSent: true,
        explanation: 'Ctrl+F5 / Cmd+Shift+R 会跳过所有缓存，直接请求服务器',
      };
    }

    if (action === 'f5') {
      if (etag === 'none' && lastModified === 'none') {
        return {
          status: '200',
          fromCache: '无',
          requestSent: true,
          explanation: 'F5 会让强缓存失效，且没有协商缓存字段，只能重新请求完整资源',
        };
      }
      return {
        status: '304 Not Modified',
        fromCache: '磁盘/内存',
        requestSent: true,
        explanation: 'F5 让强缓存失效，但协商缓存仍可能命中，服务器返回 304',
      };
    }

    if (cacheControl === 'no-store') {
      return {
        status: '200',
        fromCache: '无',
        requestSent: true,
        explanation: 'no-store 禁止任何缓存，每次都需要重新请求',
      };
    }

    if (cacheControl === 'no-cache') {
      if (etag === 'none' && lastModified === 'none') {
        return {
          status: '200',
          fromCache: '无',
          requestSent: true,
          explanation: 'no-cache 要求每次验证，但没有 ETag/Last-Modified 时只能重新请求',
        };
      }
      return {
        status: '304 Not Modified',
        fromCache: '磁盘/内存',
        requestSent: true,
        explanation: 'no-cache 每次都要发请求验证，服务器返回 304',
      };
    }

    return {
      status: '200 (from cache)',
      fromCache: cacheControl === 'max-age=0' ? '无' : '内存/磁盘',
      requestSent: cacheControl === 'max-age=0',
      explanation:
        cacheControl === 'max-age=0'
          ? 'max-age=0 表示立即过期，进入协商缓存'
          : '在 max-age 有效期内，浏览器直接使用本地缓存，不发请求',
    };
  }, [cacheControl, etag, lastModified, action]);

  return (
    <Card bordered style={{ border: '2px solid #1890ff' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Text strong>1. 响应头 Cache-Control：</Typography.Text>
          <Select
            value={cacheControl}
            onChange={setCacheControl}
            style={{ width: 240, marginLeft: 8 }}
          >
            <Option value="max-age=3600">max-age=3600</Option>
            <Option value="max-age=0">max-age=0</Option>
            <Option value="no-cache">no-cache</Option>
            <Option value="no-store">no-store</Option>
          </Select>
        </div>

        <div>
          <Typography.Text strong>2. 协商缓存字段：</Typography.Text>
          <Space>
            <span>ETag</span>
            <Select value={etag} onChange={setEtag}>
              <Option value="present">有</Option>
              <Option value="none">无</Option>
            </Select>
            <span>Last-Modified</span>
            <Select value={lastModified} onChange={setLastModified}>
              <Option value="present">有</Option>
              <Option value="none">无</Option>
            </Select>
          </Space>
        </div>

        <div>
          <Typography.Text strong>3. 用户操作：</Typography.Text>
          <Radio.Group value={action} onChange={(e) => setAction(e.target.value)}>
            <Radio value="normal">正常访问 / 地址栏回车</Radio>
            <Radio value="f5">F5 刷新</Radio>
            <Radio value="force">Ctrl+F5 强制刷新</Radio>
          </Radio.Group>
        </div>

        <Steps
          direction="vertical"
          size="small"
          current={result.requestSent ? 1 : 0}
          items={[
            { title: '检查强缓存', description: cacheControl },
            { title: result.requestSent ? '发起网络请求' : '命中本地缓存', description: result.status },
          ]}
        />

        <Card size="small" title="模拟结果">
          <Space direction="vertical">
            <div>
              状态码：<Tag color="blue">{result.status}</Tag>
            </div>
            <div>缓存来源：{result.fromCache}</div>
            <div>是否发送请求：{result.requestSent ? '是' : '否'}</div>
            <div>说明：{result.explanation}</div>
          </Space>
        </Card>
      </Space>
    </Card>
  );
};

export default HttpCacheLiveDemo;
