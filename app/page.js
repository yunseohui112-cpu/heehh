'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [screen, setScreen] = useState('menu');
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const [problemText, setProblemText] = useState('');
  const [myProcess, setMyProcess] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [imageName, setImageName] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateCount = () => {
    return wrongAnswers.length;
  };

  const analyzeWithAI = async () => {
    const process = myProcess.trim();

    if (!process) {
      alert('풀이 과정을 입력해주세요');
      return;
    }

    setIsAnalyzing(true);

    const prompt = `학생의 오답 분석 요청입니다.

문제: ${problemText || '(입력되지 않음)'}

학생의 풀이 과정:
${process}

정답: ${correctAnswer || '(입력되지 않음)'}

이 학생의 풀이를 다음과 같이 분석해주세요:

1️⃣ **어디서 틀렸나요?**
   - 개념 오류가 무엇인지 명확히 지적

2️⃣ **왜 이런 실수가 생겼나요?**
   - 논리적 오류의 원인 분석

3️⃣ **올바른 풀이는 무엇인가요?**
   - 단계별로 정확한 풀이 방법 제시
   - 각 단계마다 "왜 이렇게 하는지" 설명

4️⃣ **다음에는 이렇게 풀어보세요!**
   - 구체적인 풀이 전략 제시
   - "먼저 ___를 확인하고, 그 다음 ___를 계산한 후, 마지막으로 ___를 비교해보세요" 같은 구체적인 단계별 가이드
   - 이 문제뿐만 아니라 유사한 문제에도 적용할 수 있는 방법

5️⃣ **주의할 점**
   - 앞으로 피해야 할 실수들
   - 체크 포인트 제시

격려하고 친절한 톤으로 작성하되, 명확하고 실질적인 조언을 해주세요.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      setCurrentAnalysis(data.response);
    } catch (error) {
      alert(`오류: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalyzedAnswer = () => {
    if (!currentAnalysis) {
      alert('먼저 AI 분석을 실행해주세요');
      return;
    }

    const newWrong = {
      id: Date.now(),
      problemText,
      myProcess,
      correctAnswer,
      myAnalysis: currentAnalysis,
      imageName,
      createdDate: new Date().toLocaleDateString('ko-KR'),
      reviewCount: 0,
    };

    setWrongAnswers([newWrong, ...wrongAnswers]);
    setProblemText('');
    setMyProcess('');
    setCorrectAnswer('');
    setImageName('');
    setCurrentAnalysis('');

    alert('오답이 저장되었습니다!');
    setScreen('menu');
  };

  const renderNoteList = () => {
    if (wrongAnswers.length === 0) {
      return <div className={styles.emptyState}>저장된 오답이 없습니다</div>;
    }

    return (
      <div className={styles.scrollContainer}>
        {wrongAnswers.map((wrong, idx) => (
          <div key={wrong.id} className={styles.itemCard}>
            <div className={styles.itemHeader}>
              <span className={styles.itemDate}>
                {wrong.createdDate} · 복습: {wrong.reviewCount}회
              </span>
            </div>
            <div className={styles.itemTitle}>{wrong.problemText || '(문제 미입력)'}</div>
            <div className={styles.itemAnswer}>정답: {wrong.correctAnswer}</div>
            {wrong.myAnalysis && (
              <div className={styles.itemPreview}>{wrong.myAnalysis.substring(0, 100)}...</div>
            )}
            <button
              className={styles.btnSecondary}
              onClick={() => {
                setCurrentDetailIndex(idx);
                setScreen('detail');
              }}
              style={{ marginTop: '8px', width: '100%' }}
            >
              상세보기
            </button>
          </div>
        ))}
      </div>
    );
  };

  const deleteCurrentWrong = () => {
    if (confirm('이 오답을 삭제하시겠습니까?')) {
      setWrongAnswers(wrongAnswers.filter((_, i) => i !== currentDetailIndex));
      setScreen('note');
    }
  };

  const startReviewQuiz = () => {
    if (wrongAnswers.length === 0) {
      alert('오답이 없습니다');
      return;
    }
    setCurrentQuizIndex(0);
    setScreen('quiz');
  };

  const submitQuiz = (userAnswer) => {
    const wrong = wrongAnswers[currentQuizIndex];
    const updated =
      
