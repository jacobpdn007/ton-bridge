import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/bridge_gate.tact',
    options: {
        debug: true,
    },
};
