declare module 'vue-cropperjs' {
    import { DefineComponent } from 'vue'
    const VueCropper: DefineComponent<{
        img?: string
        autoCrop?: boolean
        autoCropWidth?: number
        autoCropHeight?: number
        fixedBox?: boolean
        centerBox?: boolean
        canMoveBox?: boolean
        canScale?: boolean
        outputType?: string
    }, any, any>
    export default VueCropper
}
