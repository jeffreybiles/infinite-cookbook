'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ErrorBoundary } from 'react-error-boundary';
import { testCases as importedTestCases, TestCase } from './test-cases';
import { classifyPrompt } from './classifier';

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="p-4 bg-red-50 rounded">
      <h2 className="text-red-800">Something went wrong:</h2>
      <pre className="text-sm text-red-600">{error.message}</pre>
    </div>
  );
};

const PromptTesterContent = () => {
  const [testCases, setTestCases] = useState<TestCase[]>(importedTestCases);

  const runTests = () => {
    const newTestCases = testCases.map(testCase => ({
      ...testCase,
      result: classifyPrompt(testCase.text)
    }));
    setTestCases(newTestCases);
  };

  const getAccuracy = () => {
    if (!testCases.length) return 0;
    const correct = testCases.filter(test =>
      test.result && test.result === test.expectedCategory
    ).length;
    return ((correct / testCases.length) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Run Tests
        </button>
        <div className="text-lg">
          Accuracy: {getAccuracy()}%
        </div>
      </div>

      <div className="mt-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Prompt</th>
              <th className="p-2 text-left">Expected</th>
              <th className="p-2 text-left">Result</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((test, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{test.text}</td>
                <td className="p-2">{test.expectedCategory}</td>
                <td className="p-2">{test.result || '-'}</td>
                <td className="p-2">
                  {test.result && (
                    <span className={`px-2 py-1 rounded ${
                      test.result === test.expectedCategory
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {test.result === test.expectedCategory ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TestPromptsPage = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Prompt Classification Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <PromptTesterContent />
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
};

export default TestPromptsPage;