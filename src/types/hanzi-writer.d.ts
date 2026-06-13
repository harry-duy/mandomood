/**
 * Type declarations cho hanzi-writer v3
 * https://hanziwriter.org/docs.html
 */

declare module "hanzi-writer" {
  interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    showCharacter?: boolean;
    strokeColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeFadeDuration?: number;
    showHintAfterMisses?: number | false;
    highlightOnComplete?: boolean;
    highlightColor?: string;
    renderer?: "svg" | "canvas";
  }

  interface AnimateOptions {
    onComplete?: () => void;
  }

  interface QuizOptions {
    onComplete?: (summary: { totalMistakes: number }) => void;
    onCorrectStroke?: () => void;
    onMistake?: (strokeData: { strokeNum: number; mistakesOnStroke: number }) => void;
  }

  interface CharacterData {
    strokes: string[];
    medians: number[][][];
  }

  class HanziWriter {
    static create(
      element: HTMLElement | string,
      character: string,
      options?: HanziWriterOptions
    ): HanziWriter;

    static loadCharacterData(
      character: string,
      options?: HanziWriterOptions
    ): Promise<CharacterData | null>;

    animateCharacter(options?: AnimateOptions): void;
    animateStroke(strokeNum: number, options?: AnimateOptions): void;
    showCharacter(options?: { duration?: number; onComplete?: () => void }): void;
    hideCharacter(options?: { duration?: number; onComplete?: () => void }): void;
    showOutline(options?: { duration?: number; onComplete?: () => void }): void;
    hideOutline(options?: { duration?: number; onComplete?: () => void }): void;
    loopCharacterAnimation(): void;
    cancelAnimation(): void;
    quiz(options?: QuizOptions): void;
    cancelQuiz(): void;
    setCharacter(character: string): Promise<void>;
    updateColor(
      colorName: "strokeColor" | "outlineColor" | "highlightColor" | "drawingColor",
      colorValue: string,
      options?: { duration?: number }
    ): void;
  }

  export default HanziWriter;
}
