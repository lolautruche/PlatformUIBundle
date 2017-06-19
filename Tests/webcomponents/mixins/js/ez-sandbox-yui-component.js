describe('ez-mixin-yui-component', function () {
    let element;

    beforeEach(function () {
        element = fixture('BasicTestFixture');
    });

    it('should define the eZ.SandboxYUIComponentMixin', function () {
        assert.isFunction(window.eZ.SandboxYUIComponentMixin);
    });
});
