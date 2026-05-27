import { type AnnotationContext, AnnotationType } from '../annotationTypes';
import { FibonacciProperties } from '../properties/fibonacciProperties';
export declare class FibonacciRetracementProperties extends FibonacciProperties {
    static is(this: void, value: unknown): value is FibonacciRetracementProperties;
    isValidWithContext(context: AnnotationContext, warningPrefix?: string): boolean;
    type: AnnotationType.FibonacciRetracement;
}
