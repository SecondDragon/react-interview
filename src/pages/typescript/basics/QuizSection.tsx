import React, { useState, useCallback } from 'react';
import {
  Card,
  Radio,
  Button,
  Typography,
  Space,
  Tag,
  Progress,
  Collapse,
  List,
  Result,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { interviewQuestions, QuizItem } from './data';

const difficultyColor: Record<string, string> = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};

const difficultyLabel: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const QuizSection: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = useCallback((qId: number, optionIndex: number) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    }
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
  }, []);

  const answeredCount = Object.keys(answers).length;
  const correctCount = submitted
    ? interviewQuestions.filter((q) => answers[q.id] === q.answer).length
    : 0;
  const totalCount = interviewQuestions.length;
  const progressPercent = submitted
    ? Math.round((correctCount / totalCount) * 100)
    : Math.round((answeredCount / totalCount) * 100);

  return (
    <div>
      {/* Progress Bar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Typography.Text strong>
            {submitted ? '答题结果' : '答题进度'}
          </Typography.Text>
          <Space>
            {submitted && (
              <Typography.Text>
                正确 {correctCount}/{totalCount}
              </Typography.Text>
            )}
            <Typography.Text type="secondary">
              {answeredCount}/{totalCount} 已答
            </Typography.Text>
          </Space>
        </div>
        <Progress
          percent={progressPercent}
          status={submitted && progressPercent < 60 ? 'exception' : 'active'}
          strokeColor={submitted && progressPercent >= 60 ? '#52c41a' : undefined}
        />
        {!submitted && answeredCount > 0 && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Button type="primary" size="large" onClick={handleSubmit}>
              提交答案
            </Button>
          </div>
        )}
        {submitted && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重新答题
            </Button>
          </div>
        )}
      </Card>

      {/* Question List */}
      <List
        dataSource={interviewQuestions}
        renderItem={(q: QuizItem) => {
          const isAnswered = answers[q.id] !== undefined;
          const isCorrect = submitted && answers[q.id] === q.answer;
          const isWrong = submitted && isAnswered && !isCorrect;

          return (
            <List.Item style={{ display: 'block', padding: '12px 0' }}>
              <Card
                style={{
                  borderLeft: isWrong
                    ? '4px solid #ff4d4f'
                    : isCorrect
                    ? '4px solid #52c41a'
                    : '4px solid #d9d9d9',
                }}
              >
                {/* Question Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Space>
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Q{q.id}.
                    </Typography.Text>
                    <Tag color={difficultyColor[q.difficulty]}>
                      {difficultyLabel[q.difficulty]}
                    </Tag>
                    {isCorrect && (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        正确
                      </Tag>
                    )}
                    {isWrong && (
                      <Tag icon={<CloseCircleOutlined />} color="error">
                        错误
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* Question Text */}
                <Typography.Paragraph
                  style={{
                    fontSize: 15,
                    marginBottom: 16,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {q.question.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < q.question.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Typography.Paragraph>

                {/* Options */}
                <Radio.Group
                  value={answers[q.id]}
                  onChange={(e) => handleSelect(q.id, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {q.options.map((opt, idx) => {
                      const isSelected = answers[q.id] === idx;
                      let radioStyle: React.CSSProperties = {
                        display: 'block',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #d9d9d9',
                        marginBottom: 4,
                        transition: 'all 0.2s',
                      };

                      if (submitted) {
                        if (idx === q.answer) {
                          // Correct answer highlight
                          radioStyle = {
                            ...radioStyle,
                            borderColor: '#52c41a',
                            backgroundColor: '#f6ffed',
                          };
                        } else if (isSelected && idx !== q.answer) {
                          // Wrong selected answer
                          radioStyle = {
                            ...radioStyle,
                            borderColor: '#ff4d4f',
                            backgroundColor: '#fff2f0',
                          };
                        }
                      } else if (isSelected) {
                        radioStyle = {
                          ...radioStyle,
                          borderColor: '#1890ff',
                          backgroundColor: '#e6f7ff',
                        };
                      }

                      return (
                        <label key={idx} style={radioStyle}>
                          <Radio value={idx} disabled={submitted}>
                            <span
                              style={{
                                whiteSpace: 'pre-wrap',
                                fontFamily:
                                  idx > 0 && opt.startsWith('```')
                                    ? 'monospace'
                                    : 'inherit',
                              }}
                            >
                              {opt
                                .replace(/```ts\n/g, '')
                                .replace(/```\n/g, '')
                                .replace(/```/g, '')
                                .split('\n')
                                .map((line, i) => (
                                  <React.Fragment key={i}>
                                    {line}
                                    {i <
                                      opt
                                        .replace(/```ts\n/g, '')
                                        .replace(/```\n/g, '')
                                        .replace(/```/g, '')
                                        .split('\n').length -
                                        1 && <br />}
                                  </React.Fragment>
                                ))}
                            </span>
                          </Radio>
                        </label>
                      );
                    })}
                  </Space>
                </Radio.Group>

                {/* Explanation Collapse */}
                {submitted && (
                  <div style={{ marginTop: 12 }}>
                    <Collapse
                      ghost
                      items={[
                        {
                          key: 'explanation',
                          label: (
                            <Typography.Text
                              type={
                                isCorrect ? 'success' : 'danger'
                              }
                            >
                              {isCorrect
                                ? '✅ 回答正确！点击查看解析'
                                : '❌ 回答错误，点击查看解析'}
                            </Typography.Text>
                          ),
                          children: (
                            <div
                              style={{
                                padding: '8px 12px',
                                background: '#fafafa',
                                borderRadius: 4,
                              }}
                            >
                              <Typography.Text>
                                {q.explanation}
                              </Typography.Text>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                )}
              </Card>
            </List.Item>
          );
        }}
      />

      {/* Summary */}
      {submitted && (
        <Card style={{ marginTop: 16, textAlign: 'center' }}>
          <Result
            status={progressPercent >= 60 ? 'success' : 'warning'}
            title={`答对 ${correctCount} / ${totalCount} 题`}
            subTitle={
              progressPercent >= 80
                ? '优秀！你对 TypeScript 基础类型系统掌握得很好！'
                : progressPercent >= 60
                ? '不错，但还有提升空间，建议重新复习错误题目。'
                : '需要加强练习，建议先阅读上方知识点再重新答题。'
            }
            extra={
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重新答题
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default QuizSection;
