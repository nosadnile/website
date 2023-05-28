import type { Meta, StoryObj } from "@storybook/vue3";

import MenuButton from "../components/MenuButton.vue";

const meta: Meta<typeof MenuButton> = {
    title: "MenuButton",
    component: MenuButton,

    argTypes: {
        name: {
            type: "string",
            defaultValue: "Button Example",
        },
    },
};

export default meta;

type Story = StoryObj<typeof MenuButton>;

export const Primary: Story = {
    render: (args) => ({
        components: { MenuButton },
        
        setup() {
            return { args };
        },
        
        template: `<MenuButton v-bind="args" />`,
    }),
    
    args: {
        name: "Button Example",
    },
};
