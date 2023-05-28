import type { Meta, StoryObj } from "@storybook/vue3";

import PrimaryButton from "../components/PrimaryButton.vue";

const meta: Meta<typeof PrimaryButton> = {
    title: "PrimaryButton",
    component: PrimaryButton,

    argTypes: {
        name: {
            type: "string",
            defaultValue: "Button Example",
        },
    },
};

export default meta;

type Story = StoryObj<typeof PrimaryButton>;

export const Primary: Story = {
    render: (args) => ({
        components: { PrimaryButton },
        
        setup() {
            return { args };
        },
        
        template: `<PrimaryButton v-bind="args" />`,
    }),
    
    args: {
        name: "Button Example",
    },
};
