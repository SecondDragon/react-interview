import React from 'react';
import { Typography } from 'antd';
import type { InterviewQuestion } from './data';

interface InterviewQAProps {
  questions: InterviewQuestion[];
}

const InterviewQA: React.FC<InterviewQAProps> = ({ questions }) => {
  return (
    <div>
      {questions.map((item) => (
        <div key={item.key} style={{ marginBottom: 16 }}>
          <Typography.Text strong>{item.question}</Typography.Text>
          <Typography.Paragraph type="secondary">{item.answer}</Typography.Paragraph>
        </div>
      ))}
    </div>
  );
};

export default InterviewQA;
