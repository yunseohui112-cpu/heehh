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

  const showDetail = (idx) => {
    setCurrentDetailIndex(idx);
    setScreen('detail');
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
    const updated = [...wrongAnswers];
    updated[currentQuizIndex].reviewCount++;
    setWrongAnswers(updated);

    if (userAnswer.trim().toLowerCase() === wrong.correctAnswer.trim().toLowerCase()) {
      alert('정답입니다! 👏');
    } else {
      alert(`오답입니다.\n정답: ${wrong.correctAnswer}`);
    }

    if (currentQuizIndex + 1 < wrongAnswers.length) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      alert('모든 오답을 복습했습니다!');
      setScreen('menu');
    }
  };

  return (
    <div className={styles.container}>
      {/* 메인 메뉴 */}
      {screen === 'menu' && (
        <div>
          <h1 className={styles.h1}>오답 분석 & 복습 노트</h1>
          <div className={styles.buttonGroup}>
            <button
              className={styles.btnPrimary}
              onClick={() => setScreen('add')}
            >
              📸 새 오답 등록
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => setScreen('note')}
            >
              📚 오답노트 ({updateCount()})
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => startReviewQuiz()}
            >
              ❓ 복습 퀴즈
            </button>
          </div>
        </div>
      )}

      {/* 새 오답 등록 */}
      {screen === 'add' && (
        <div>
          <h2 className={styles.h2}>새 오답 등록</h2>

          <div className={styles.formGroup}>
            <label>1️⃣ 문제 사진 (선택사항)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageName(e.target.files[0]?.name || '')}
            />
            {imageName && <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>✓ {imageName}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>2️⃣ 문제 설명</label>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="문제를 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label>3️⃣ 나의 풀이 과정 ⭐</label>
            <textarea
              value={myProcess}
              onChange={(e) => setMyProcess(e.target.value)}
              placeholder="어떻게 풀었는지 설명해주세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label>4️⃣ 정답</label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
            />
          </div>

          <div className={styles.buttonRow}>
            <button
              className={styles.btnPrimary}
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '분석 중...' : '🤖 AI 분석'}
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => setScreen('menu')}
            >
              돌아가기
            </button>
          </div>

          {currentAnalysis && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f0f9ff',
              borderRadius: '8px',
              borderLeft: '4px solid #0ea5e9'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#0284c7' }}>
                AI 분석 결과
              </h3>
              <div style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#333',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {currentAnalysis}
              </div>
              <div className={styles.buttonRow} style={{ marginTop: '12px' }}>
                <button className={styles.btnPrimary} onClick={saveAnalyzedAnswer}>
                  저장
                </button>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setCurrentAnalysis('')}
                >
                  다시 분석
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 오답노트 */}
      {screen === 'note' && (
        <div>
          <h2 className={styles.h2}>📚 오답노트</h2>
          {renderNoteList()}
          <button
            className={styles.btnSecondary}
            onClick={() => setScreen('menu')}
            style={{ width: '100%', marginTop: '20px' }}
          >
            돌아가기
          </button>
        </div>
      )}

      {/* 상세보기 */}
      {screen === 'detail' && wrongAnswers[currentDetailIndex] && (
        <div>
          <h2 className={styles.h2}>📖 상세보기</h2>
          <div className={styles.itemCard}>
            <div className={styles.itemDate}>
              {wrongAnswers[currentDetailIndex].createdDate} · 복습:{' '}
              {wrongAnswers[currentDetailIndex].reviewCount}회
            </div>
            <div style={{ marginTop: '12px', lineHeight: '1.6' }}>
              <p>
                <strong>문제:</strong> {wrongAnswers[currentDetailIndex].problemText || '(미입력)'}
              </p>
              <p style={{ marginTop: '8px' }}>
                <strong>풀이:</strong> {wrongAnswers[currentDetailIndex].myProcess}
              </p>
              <p style={{ marginTop: '8px', color: '#0ea5e9' }}>
                <strong>정답:</strong> {wrongAnswers[currentDetailIndex].correctAnswer}
              </p>
              {wrongAnswers[currentDetailIndex].myAnalysis && (
                <p style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                  <strong>분석:</strong> {wrongAnswers[currentDetailIndex].myAnalysis}
                </p>
              )}
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={styles.btnSecondary}
              onClick={() => setScreen('note')}
            >
              뒤로
            </button>
            <button
              className={styles.btnDanger}
              onClick={deleteCurrentWrong}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* 복습 퀴즈 */}
      {screen === 'quiz' && wrongAnswers[currentQuizIndex] && (
        <QuizScreen
          wrong={wrongAnswers[currentQuizIndex]}
          index={currentQuizIndex}
          total={wrongAnswers.length}
          onSubmit={submitQuiz}
          onMenu={() => setScreen('menu')}
        />
      )}
    </div>
  );
}

function QuizScreen({ wrong, index, total, onSubmit, onMenu }) {
  const [userAnswer, setUserAnswer] = useState('');

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '0.5rem' }}>
        ❓ 복습 퀴즈
      </h2>
      <p style={{ fontSize: '13px', color: '#999', marginBottom: '1.5rem' }}>
        {index + 1} / {total}
      </p>

      <div style={{
        background: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        fontSize: '15px',
        lineHeight: '1.6'
      }}>
        {wrong.problemText || '(문제)'}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
          정답을 입력하세요:
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="정답"
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => onSubmit(userAnswer)}
          style={{
            flex: 1,
            padding: '12px',
            background: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          제출
        </button>
        <button
          onClick={() => onSubmit('')}
          style={{
            flex: 1,
            padding: '12px',
            background: '#f5f5f5',
            color: '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          스킵
        </button>
        <button
          onClick={onMenu}
          style={{
            flex: 1,
            padding: '12px',
            background: '#f5f5f5',
            color: '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          메뉴
        </button>
      </div>
    </div>
  );
}
