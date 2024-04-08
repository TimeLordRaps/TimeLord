const basicActions = {
    click: async (page, selector) => {
        await page.click(selector);
    },
    navigate: async (page, url) => {
        await page.goto(url);
    },
};

const executeCustomScript = async (page, script) => {
    return await page.evaluate(script);
};

module.exports = { basicActions, executeCustomScript };
