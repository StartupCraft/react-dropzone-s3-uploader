import React from 'react'
import PropTypes from 'prop-types'
import S3Upload from 'react-s3-uploader/s3upload'
import Dropzone from 'react-dropzone'

class DropzoneS3Uploader extends React.Component {
  componentWillMount = () => this.setUploaderOptions(this.props)
  componentWillReceiveProps = props => this.setUploaderOptions(props)

  setUploaderOptions = props => {
    this.setState({
      uploaderOptions: Object.assign({
        signingUrl: '/s3/sign',
        s3path: '',
        contentDisposition: 'auto',
        uploadRequestHeaders: {'x-amz-acl': 'public-read'},
        onFinishS3Put: this.handleFinish,
        onProgress: this.handleProgress,
        onError: this.handleError,
      }, props.upload),
    })
  }

  handleProgress = (progress, textState, file) => {
    this.props.onProgress && this.props.onProgress(progress, textState, file)
  }

  handleError = (err, file) => {
    this.props.onError && this.props.onError(err, file)
  }

  handleFinish = (info, file) => {
    const uploadedFile = Object.assign({
      file,
      fileUrl: this.fileUrl(this.props.s3Url, info.filename),
    }, info)

    this.uploader = null

    this.props.onFinish && this.props.onFinish(uploadedFile)
  }

  handleDrop = (files, rejectedFiles) => {
    const options = {
      files,
      ...this.state.uploaderOptions,
    }

    this.uploader = new S3Upload(options)

    this.props.onDrop && this.props.onDrop(files, rejectedFiles)
  }

  fileUrl = (s3Url, filename) => `${s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url}/${filename}`

  render() {
    const {
      children,
      className,
      notDropzoneProps,
      ...rest
    } = this.props

    notDropzoneProps.forEach(prop => delete rest[prop])

    return (
      <Dropzone ref={c => this.dropzone = c} onDrop={this.handleDrop} {...rest}>
        {({ getRootProps, getInputProps }) =>
          <div {...getRootProps()} className={className}>
            <input {...getInputProps()} />
            {children}
          </div>
        }
      </Dropzone>
    )
  }
}

DropzoneS3Uploader.defaultProps = {
  upload: {},
  passChildrenProps: true,
  className: null,
  notDropzoneProps: ['onFinish', 's3Url', 'host', 'upload', 'notDropzoneProps'],
}

DropzoneS3Uploader.propTypes = {
  s3Url: PropTypes.string.isRequired,
  notDropzoneProps: PropTypes.array.isRequired,

  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  className: PropTypes.string,

  onDrop: PropTypes.func,
  onError: PropTypes.func,
  onProgress: PropTypes.func,
  onFinish: PropTypes.func,

  // Passed to react-s3-uploader
  upload: PropTypes.object.isRequired,
}

export default DropzoneS3Uploader
