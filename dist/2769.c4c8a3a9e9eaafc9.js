(self.webpackChunkGene=self.webpackChunkGene||[]).push([[2769],{80484:(oo,zt,w)=>{"use strict";w.d(zt,{J:()=>p});var _=w(24850),h=w(13125),k=w(94650),A=w(18497);let p=(()=>{class C{constructor(R){this.apollo=R}singleUpload(R,I){return this.apollo.mutate({mutation:h.ZP`
          mutation SingleUpload($file: Upload! $customFileName: String) {
            SingleUpload(file: $file, custom_file_name: $customFileName) {
              s3_file_name
              file_url
              file_name
              mime_type
            }
          }
        `,variables:{file:R,customFileName:I},context:{useMultipart:!0}}).pipe((0,_.U)(N=>N.data.SingleUpload))}deleteFileUpload(R){return this.apollo.mutate({mutation:h.ZP`
        mutation {
          DeleteFileUpload(file_name:"${R}")
        }