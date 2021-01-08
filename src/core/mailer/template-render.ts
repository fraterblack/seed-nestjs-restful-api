import * as Mustache from 'mustache';

import { IBaseTemplate } from './interfaces/base-template.interface';
import { ITemplateRender } from './interfaces/template-render.interface';

export abstract class TemplateRender implements ITemplateRender {
    constructor(private baseTemplate?: IBaseTemplate) {
    }

    abstract templateHtml(): string;

    abstract templateText(): string;

    abstract viewData(): {};

    renderHtml(): string {
        if (this.baseTemplate) {
            const content = Mustache.render(this.templateHtml(), this.viewData());

            return Mustache.render(this.baseTemplate.templateHtml(), {}, { content });
        } else {
            return Mustache.render(this.templateHtml(), this.viewData());
        }
    }

    renderText(): string {
        if (this.baseTemplate) {
            const content = Mustache.render(this.templateText(), this.viewData());

            return Mustache.render(this.baseTemplate.templateText(), {}, { content });
        } else {
            return Mustache.render(this.templateText(), this.viewData());
        }
    }
}
