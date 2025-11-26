declare function createCircuit(name: string, templateName?: string): Promise<void>;

declare function compileCircuit(circuit: string, options: any): Promise<void>;

declare function testCircuit(circuit: string, inputFile?: string): Promise<void>;

declare function listTemplates(): void;

declare function initProject(): Promise<void>;

interface CircuitTemplate {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    circuit: string;
    sampleInput: any;
    useCases?: string[];
}
declare const TEMPLATES: {
    [key: string]: CircuitTemplate;
};

export { type CircuitTemplate, TEMPLATES, compileCircuit, createCircuit, initProject, listTemplates, testCircuit };
