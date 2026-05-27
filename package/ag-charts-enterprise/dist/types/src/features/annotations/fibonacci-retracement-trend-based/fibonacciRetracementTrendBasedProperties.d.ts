import { PointProperties } from '../annotationProperties';
import { type AnnotationContext, AnnotationType } from '../annotationTypes';
import { FibonacciProperties } from '../properties/fibonacciProperties';
export declare class FibonacciRetracementTrendBasedProperties extends FibonacciProperties {
    static is(this: void, value: unknown): value is FibonacciRetracementTrendBasedProperties;
    isValidWithContext(context: AnnotationContext, warningPrefix?: string): boolean;
    type: AnnotationType.FibonacciRetracementTrendBased;
    endRetracement: PointProperties;
}
