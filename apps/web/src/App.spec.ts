import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { router } from './router';
import App from './App.vue';

describe('App', () => {
  it('mounts with router and pinia', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
