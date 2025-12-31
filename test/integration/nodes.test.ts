/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Virtuals } from '../../nodes/Virtuals/Virtuals.node';
import { VirtualsTrigger } from '../../nodes/Virtuals/VirtualsTrigger.node';

describe('Virtuals Node', () => {
  let virtualsNode: Virtuals;

  beforeEach(() => {
    virtualsNode = new Virtuals();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(virtualsNode.description.displayName).toBe('Virtuals');
    });

    it('should have correct name', () => {
      expect(virtualsNode.description.name).toBe('virtuals');
    });

    it('should have correct version', () => {
      expect(virtualsNode.description.version).toBe(1);
    });

    it('should be in transform group', () => {
      expect(virtualsNode.description.group).toContain('transform');
    });

    it('should have one input', () => {
      expect(virtualsNode.description.inputs).toEqual(['main']);
    });

    it('should have one output', () => {
      expect(virtualsNode.description.outputs).toEqual(['main']);
    });
  });

  describe('Credentials', () => {
    it('should require virtualsApi credentials', () => {
      const apiCred = virtualsNode.description.credentials?.find(
        (c: any) => c.name === 'virtualsApi'
      );
      expect(apiCred).toBeDefined();
      expect(apiCred?.required).toBe(true);
    });

    it('should optionally require virtualsWallet for trading', () => {
      const walletCred = virtualsNode.description.credentials?.find(
        (c: any) => c.name === 'virtualsWallet'
      );
      expect(walletCred).toBeDefined();
      expect(walletCred?.required).toBe(false);
    });
  });

  describe('Resources', () => {
    it('should have agent resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'agent')).toBe(true);
    });

    it('should have game resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'game')).toBe(true);
    });

    it('should have token resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'token')).toBe(true);
    });

    it('should have conversation resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'conversation')).toBe(true);
    });

    it('should have revenue resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'revenue')).toBe(true);
    });

    it('should have social resource', () => {
      const resourceProp = virtualsNode.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      const options = resourceProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'social')).toBe(true);
    });
  });

  describe('Agent Operations', () => {
    it('should have list operation', () => {
      const operationProps = virtualsNode.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      const agentOps = operationProps.find((p: any) =>
        p.displayOptions?.show?.resource?.includes('agent')
      );
      const options = agentOps?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'list')).toBe(true);
    });

    it('should have create operation', () => {
      const operationProps = virtualsNode.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      const agentOps = operationProps.find((p: any) =>
        p.displayOptions?.show?.resource?.includes('agent')
      );
      const options = agentOps?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'create')).toBe(true);
    });

    it('should have start and stop operations', () => {
      const operationProps = virtualsNode.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      const agentOps = operationProps.find((p: any) =>
        p.displayOptions?.show?.resource?.includes('agent')
      );
      const options = agentOps?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'start')).toBe(true);
      expect(options?.some((o: any) => o.value === 'stop')).toBe(true);
    });
  });

  describe('Token Operations', () => {
    it('should have trade operation', () => {
      const operationProps = virtualsNode.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      const tokenOps = operationProps.find((p: any) =>
        p.displayOptions?.show?.resource?.includes('token')
      );
      const options = tokenOps?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'trade')).toBe(true);
    });

    it('should have getPrice operation', () => {
      const operationProps = virtualsNode.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      const tokenOps = operationProps.find((p: any) =>
        p.displayOptions?.show?.resource?.includes('token')
      );
      const options = tokenOps?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'getPrice')).toBe(true);
    });
  });
});

describe('VirtualsTrigger Node', () => {
  let triggerNode: VirtualsTrigger;

  beforeEach(() => {
    triggerNode = new VirtualsTrigger();
  });

  describe('Node Description', () => {
    it('should have correct display name', () => {
      expect(triggerNode.description.displayName).toBe('Virtuals Trigger');
    });

    it('should have correct name', () => {
      expect(triggerNode.description.name).toBe('virtualsTrigger');
    });

    it('should be in trigger group', () => {
      expect(triggerNode.description.group).toContain('trigger');
    });

    it('should have no inputs', () => {
      expect(triggerNode.description.inputs).toEqual([]);
    });

    it('should have one output', () => {
      expect(triggerNode.description.outputs).toEqual(['main']);
    });
  });

  describe('Event Categories', () => {
    it('should have agent event category', () => {
      const categoryProp = triggerNode.description.properties.find(
        (p: any) => p.name === 'eventCategory'
      );
      const options = categoryProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'agent')).toBe(true);
    });

    it('should have token event category', () => {
      const categoryProp = triggerNode.description.properties.find(
        (p: any) => p.name === 'eventCategory'
      );
      const options = categoryProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'token')).toBe(true);
    });

    it('should have revenue event category', () => {
      const categoryProp = triggerNode.description.properties.find(
        (p: any) => p.name === 'eventCategory'
      );
      const options = categoryProp?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'revenue')).toBe(true);
    });
  });

  describe('Agent Events', () => {
    it('should have agent.created event', () => {
      const eventProps = triggerNode.description.properties.filter(
        (p: any) => p.name === 'event'
      );
      const agentEvents = eventProps.find((p: any) =>
        p.displayOptions?.show?.eventCategory?.includes('agent')
      );
      const options = agentEvents?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'agent.created')).toBe(true);
    });

    it('should have agent.status event', () => {
      const eventProps = triggerNode.description.properties.filter(
        (p: any) => p.name === 'event'
      );
      const agentEvents = eventProps.find((p: any) =>
        p.displayOptions?.show?.eventCategory?.includes('agent')
      );
      const options = agentEvents?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'agent.status')).toBe(true);
    });
  });

  describe('Token Events', () => {
    it('should have token.price event', () => {
      const eventProps = triggerNode.description.properties.filter(
        (p: any) => p.name === 'event'
      );
      const tokenEvents = eventProps.find((p: any) =>
        p.displayOptions?.show?.eventCategory?.includes('token')
      );
      const options = tokenEvents?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'token.price')).toBe(true);
    });

    it('should have token.large_trade event', () => {
      const eventProps = triggerNode.description.properties.filter(
        (p: any) => p.name === 'event'
      );
      const tokenEvents = eventProps.find((p: any) =>
        p.displayOptions?.show?.eventCategory?.includes('token')
      );
      const options = tokenEvents?.options as Array<{ value: string }>;
      expect(options?.some((o: any) => o.value === 'token.large_trade')).toBe(true);
    });
  });

  describe('Threshold Options', () => {
    it('should have price threshold option', () => {
      const thresholdProp = triggerNode.description.properties.find(
        (p: any) => p.name === 'priceThreshold'
      );
      expect(thresholdProp).toBeDefined();
      expect(thresholdProp?.type).toBe('number');
      expect(thresholdProp?.default).toBe(5);
    });

    it('should have trade threshold option', () => {
      const thresholdProp = triggerNode.description.properties.find(
        (p: any) => p.name === 'tradeThreshold'
      );
      expect(thresholdProp).toBeDefined();
      expect(thresholdProp?.type).toBe('number');
      expect(thresholdProp?.default).toBe(10000);
    });
  });
});
