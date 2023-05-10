import { expect } from 'chai';
import { BaseCommandFactory, Command } from './command-factory';
import { BaseEventHandler } from './event-handler';

describe('Event handler', () => {
    describe('Command input', () => {
        it('should create a command based on a string', () => {
            const executer = {
                log: [] as Command[],
                execute(command: Command) {
                    this.log.push(command);
                }
            };
            const hdl = new BaseEventHandler(new BaseCommandFactory(), executer);

            hdl.actionSelected('DeleteNote');
            
            expect(executer.log).to.deep.eq([{ name: 'del note' }]);
        });
    });
});