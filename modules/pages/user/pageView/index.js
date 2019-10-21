import template from './template.marko';
import site from '../../../../shared/lib/site';
import locale from '../../../../shared/lib/locale';
import templates from '../../../../etc/templates.json';

export default fastify => ({
    async handler(req, rep) {
        try {
            if (req.urlData()) {
                const {
                    url,
                    language
                } = locale.getNonLocalizedURL(req);
                const page = await this.mongo.db.collection('pages').findOne({
                    fullPath: url
                });
                if (!page || !page.data || !page.data[language]) {
                    rep.callNotFound();
                    return rep.code(204);
                }
                const siteData = await site.getSiteData(req, fastify, this.mongo.db, page);
                siteData.title = `${page.data[language].title} | ${siteData.title}`;
                const render = (await template.render({
                    content: page.data[language].contentCompiled || page.data[language].content,
                    $global: {
                        siteData,
                        t: siteData.t,
                        template: page.template || templates.available[0],
                    }
                }));
                const html = render.out.stream.str.replace(/\[breadcrumbs\]/gm, siteData.breadcrumbsHTML);
                return rep.code(200).type('text/html').send(html);
            }
            rep.callNotFound();
            return rep.code(204);
        } catch (e) {
            return Promise.reject(e);
        }
    }
});
