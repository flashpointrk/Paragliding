'use client';

/**
 * FAQ form (create/edit).
 */

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';

export interface FaqData {
  id?: string;
  question: string;
  questionTr?: string | null;
  answer: string;
  answerTr?: string | null;
  sortOrder: number;
  active: boolean;
}

interface Props {
  initial?: FaqData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function FaqForm({ initial, onClose, onSuccess }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [questionTr, setQuestionTr] = useState(initial?.questionTr ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [answerTr, setAnswerTr] = useState(initial?.answerTr ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const payload = {
      question: question.trim(),
      questionTr: questionTr.trim() || null,
      answer: answer.trim(),
      answerTr: answerTr.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      active,
    };

    const url = initial?.id ? `/api/admin/faq/${initial.id}` : '/api/admin/faq';
    const method = initial?.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.message ?? 'Could not save.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
        disabled={loading}
        error={errors.question}
      />
      <Input
        label="Question (TR)"
        value={questionTr}
        onChange={(e) => setQuestionTr(e.target.value)}
        disabled={loading}
        hint="When empty, the Turkish page falls back to the default-locale text."
      />
      <Textarea
        label="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        disabled={loading}
        rows={6}
        error={errors.answer}
      />
      <Textarea
        label="Answer (TR)"
        value={answerTr}
        onChange={(e) => setAnswerTr(e.target.value)}
        disabled={loading}
        rows={6}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <Input
          label="Sort order"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={loading}
          hint="Lower values first"
        />
        <div className="pt-7">
          <Checkbox
            label="Active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={loading}
          />
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Saving…' : initial?.id ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
