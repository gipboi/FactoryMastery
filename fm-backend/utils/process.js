import dayjs from 'dayjs';
import { getValidArray } from '.';
import { getName } from './user';
import { ColorSchemeEnum } from '../constants/enums/pdf.enum';
import { MediaTypeEnum } from '../constants/enums/media-type.enum';

export async function getProcessDetailPdfTemplate(data) {
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Process Detail</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600&display=swap');
        
        @page {
            size: A4;
            margin: 2cm;
        }

        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Noto Sans', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
            background-color: #fff;
            position: relative;
        }
        
        .page-container {
            max-width: 21cm;
            margin: 0 auto;
            padding: 20px;
        }
        
        .document-title {
            color: #333;
            padding: 12px 20px;
            margin: 0 0 20px 0;
            border-radius: 4px;
            font-family: 'Playfair Display', serif;
            font-size: 20pt;
            font-weight: 600;
            text-align: center;
        }

        .header {
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header h3 {
            margin: 0;
        }
        
        .content {
            padding-bottom: 20px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .detail-label {
            flex: 0 0 150px;
            color: #555;
            font-weight: 500;
        }
        
        .detail-value {
            flex: 1;
            display: flex;
            align-items: center;
        }
        
        .avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #e0e0e0;
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .avatar svg {
            width: 14px;
            height: 14px;
            fill: #999;
        }
        
        .tag {
            display: inline-block;
            background-color: #f0f0f0;
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 10pt;
        }
        
        .list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background-color: #f5f7fa;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        .list-item-content {
            display: flex;
            align-items: center;
        }

        .list-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: #d32f2f;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            margin-right: 8px;
        }
        
        .options-icon {
            color: #999;
        }
        
        .empty-value {
            color: #999;
            font-style: italic;
        }

        .space-4 {
            margin-right: 4px;
        }

        .list-item {
            border-left: 3px solid #f0f0f0;
        }
        
        .list-item:hover {
            border-left: 3px solid #333;
        }

        .step-container {
            margin-bottom: 40px;
            border: 1px solid #eee;
            border-radius: 6px;
            overflow: hidden;
        }

        .step-header {
            display: flex;
            align-items: center;
            background-color: #f5f7fa;
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
        }

        .step-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            margin-right: 12px;
        }

        .step-number {
            font-weight: 600;
            margin-right: 8px;
            color: #666;
        }

        .step-name {
            font-weight: 500;
            flex: 1;
        }

        .step-content {
            padding: 16px;
        }

        .block {
            margin-bottom: 20px;
            padding: 16px;
            background-color: #fff;
            border: 1px solid #eee;
            border-radius: 4px;
        }

        .block-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }

        .block-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            margin-right: 8px;
        }

        .media-container {
            margin-top: 16px;
        }

        .media-item {
            margin-bottom: 16px;
        }

        .media-title {
            font-weight: 500;
            margin-bottom: 8px;
            color: #555;
        }

        .embed-container {
            background-color: #f5f7fa;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #eee;
        }

        .embed-link {
            color: #00A9EB;
            text-decoration: none;
            word-break: break-all;
        }

        .embed-link:hover {
            text-decoration: underline;
        }

        .image-container {
            max-width: 100%;
            text-align: center;
        }

        .image-container img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }

        .media-item::before {
            content: "•";
            margin-right: 6px;
            color: black;
            font-size: 16px;
        }

        .decision-point-container {
            margin-left: 24px;
        }

        .decision-point-container-step {
            padding-left: 12px;
            border-left: 4px solid ${ColorSchemeEnum.PRIMARY}
        }

        .decision-point-media-item .image-container {
            display: flex;
            justify-content: flex-start;
        }

        .decision-point-media-item .image-container img {
            width: 156px;
            height: 156px;
        }

        .decision-point-title:before {
            content: "•";
            margin-right: 6px;
            color: black;
            font-size: 16px;
        }

        .decision-point-title {
            margin-bottom: 8px;
            font-weight: bold;
            color: black;
        }

        .decision-point-step-title {
            text-decoration: underline;
            color: ${ColorSchemeEnum.PRIMARY};
            margin-bottom: 8px;
        }

        .decision-point-step-title svg {
            margin-right: 12px;
        }

        .flex {
            display: flex;
        }
        
        .mb-8 {
            margin-bottom: 8px;
        }

        .text-with-icon {
            display: flex;
            align-items: center;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="document-title">${data?.name}</div>
        <div class="header">
            <h3>Process Detail</h3>
        </div>
        
        <div class="content">
            <div class="detail-row">
                <div class="detail-label">Created by</div>
                <div class="detail-value">${data?.creatorName || ''}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Version number</div>
                <div class="detail-value">${data?.version}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Last updated</div>
                <div class="detail-value">${dayjs(data?.updatedAt).format(
                  'MMMM DD, YYYY'
                )}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Release notes</div>
                <div class="detail-value ${
                  !data?.releaseNote ? 'empty-value' : ''
                }">${data?.releaseNote || 'No release notes available'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Editor notes</div>
                <div class="detail-value ${
                  !data?.editorNote ? 'empty-value' : ''
                }">${data?.editorNote || 'No editor notes available'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Document type</div>
                <div class="detail-value">${
                  data?.documentType?.name || ''
                }</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Tags</div>
                 <div class="space-4">
                    ${getValidArray(data?.tags)
                      .map((tag) => {
                        return tag?.name
                          ? `<span class="tag">${tag?.name}</span>`
                          : '';
                      })
                      .join(' ')}
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Collections${
                  data?.collections?.length
                    ? ` (${data?.collections?.length})`
                    : ''
                }</div>
                <div class="detail-value">
                    <div class="space-4">
                    ${getValidArray(data?.collections)
                      .map((collection) => {
                        return `
                        <div class="list-item">
                            <div class="list-item-content">
                                <div class="list-icon red">${collection?.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}</div>
                                ${collection?.name || ''}
                            </div>
                        </div>
                        `;
                      })
                      .join('')}
                    </div>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Groups${
                  data?.groups?.length ? ` (${data?.groups?.length})` : ''
                }</div>
                <div class="detail-value">
                    <div class="space-4">
                      ${getValidArray(data?.groups)
                        .map((group) => {
                          return `
                            <div class="list-item">
                                <div class="list-item-content">
                                    <div class="list-icon green">${group?.name
                                      ?.charAt(0)
                                      ?.toUpperCase()}</div>
                                    ${group?.name || ''}
                                </div>
                            </div>
                        `;
                        })
                        .join('')}
                    </div>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Users${
                  data?.userProcesses?.length
                    ? ` (${data?.userProcesses?.length})`
                    : ''
                }</div>
                <div class="detail-value">
                    <div class="space-4">
                        ${getValidArray(data?.userProcesses)
                          .map((userProcess) => {
                            return `
                                <div class="list-item">
                                    <div class="list-item-content">
                                        <div class="list-icon dark-green">${userProcess?.user?.firstName
                                          ?.charAt(0)
                                          .toUpperCase()}</div>
                                        ${getName(userProcess?.user)}
                                    </div>
                                </div>`;
                          })
                          .join('')}                  
                    </div>
                </div>
            </div>
        </div>

        <div class="header">
            <h3>Step Detail</h3>
        </div>

        <div class="content">
            ${getValidArray(data?.steps)
              .map((step, index) => {
                return `
                    <div class="step-container">
                    <div class="step-header">
                        <div class="step-icon" style="background-color: ${
                          step?.icon?.color || ColorSchemeEnum.PRIMARY
                        };">${index + 1}</div>
                        <div class="step-name">${step?.name || ''}</div>
                    </div>
                    <div class="step-content">
                       ${
                         getValidArray(step?.blocks).length
                           ? `
                            ${getValidArray(step?.blocks)
                              .map((block, blockIndex) => {
                                return `
                                    <div class="block">
                                        <div class="block-header">
                                            <div class="block-icon" style="background-color: ${
                                              block?.icon?.icon ||
                                              ColorSchemeEnum.DEFAULT_BLOCK_ICON_COLOR
                                            };">${blockIndex + 1}</div>
                                        </div>
                                        <div>
                                            <div>${block?.content || ''}</div>
                                        </div>
                                        ${getBlockMediaList(block)}
                                        ${getBlockDecisionPointList(block)}
                                    </div>`;
                              })
                              .join('')}`
                           : `
                            <div class="media-container">
                            ${getValidArray(step?.media)
                              .map((media) => getMediaDetail(media))
                              .join('')}
                            </div>`
                       }
                    </div>
                </div>`;
              })
              .join('')}
        </div>
    </div>
</body>
</html>`;

  return html?.replace(/undefined/g, '');
}

function getMediaDetail(media, isDisableMediaLabel = false) {
  return `
    <div class="media-item">
        ${
          !isDisableMediaLabel
            ? media?.name && `<div class="media-title">${media?.name}</div>`
            : ''
        }
        ${getMediaType(media)}
    </div>`;
}

function getDecisionPointMediaDetail(media, isDisableMediaLabel = false) {
  return `
    <div class="decision-point-media-item mb-8">
        ${
          !isDisableMediaLabel
            ? media?.name && `<div class="media-title">${media?.name}</div>`
            : ''
        }
        ${getMediaType(media)}
    </div>`;
}

function getMediaType(media) {
  switch (media?.mediaType) {
    case MediaTypeEnum.IMAGE:
      return `
        <div class="image-container">
            <img src="${media?.url}" alt="${media?.name || ''}" />
        </div>`;
    default:
      return `
        <div class="embed-container">
            <a href="${media?.url}" class="embed-link" target="_blank">
                ${media?.url}
            </a>
        </div>`;
  }
}

function getBlockMediaList(block) {
  if (block?.blockMedias?.length) {
    return getValidArray(block?.blockMedias)
      .map((blockMedia) =>
        getDecisionPointMediaDetail(
          blockMedia?.media?.[0],
          block?.isDisableMediaLabel
        )
      )
      .join('');
  }
  return '';
}

function getBlockDecisionPointList(block) {
  if (block?.decisionPoints?.length) {
    return `
        <div class="decision-point-wrapper">
            <span class="text-with-icon">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="blue"
                >
                    <path
                        d="M12 20V17.6M12 6.4V4M20 12H17.6M6.4 12H4M17.6569 6.34315L15.9598 8.0402M8.0402 15.9598L6.34315 17.6569M6.34293 6.34332L8.03999 8.04038M15.9596 15.96L17.6566 17.657"
                        stroke="${ColorSchemeEnum.DECISION_POINT_COLOR}"
                        stroke-width="2"
                        stroke-linecap="round"
                    /></svg
                >Decision Points:</span
            >
            ${getValidArray(block?.decisionPoints)
              .map((decisionPoint) => {
                return `
                    <div class="decision-point-container">
                        <div class="decision-point-title">${
                          decisionPoint?.title ?? ''
                        }</div>
                        <div class="decision-point-container-step">
                            ${getValidArray(decisionPoint?.decisionPointSteps)
                              .map((decisionPointStep) => {
                                return `
                                            <div class="decision-point-step-title flex">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><g clip-path="url(#clip0_8682_105578)"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9842 18.0059C15.329 18.4492 16.5165 18.7316 18.2227 19.2363C17.5672 27.209 9.7356 24.0428 13.9842 18.0059ZM20.9788 10.6814C20.8905 8.28751 20.4525 5.14729 16.9636 5.63933C15.328 6.05022 14.1196 7.77932 13.5513 10.7625C13.2391 12.4028 13.4206 14.7051 13.7888 16.0852C14.125 17.0578 14.0107 16.9981 14.372 17.1827C15.7706 17.486 17.1551 17.8218 18.5651 18.1641C19.9974 17.1904 21.1738 12.021 20.9788 10.6814ZM10.2113 10.4975C10.5792 9.11718 10.7607 6.81484 10.4487 5.17478C9.88082 2.19142 8.67223 0.462047 7.03644 0.0514426C3.54753 -0.440599 3.10951 2.69957 3.02121 5.09358C2.82624 6.43301 4.00275 11.6027 5.43521 12.5762C6.84505 12.2339 8.22939 11.8984 9.62838 11.5949C9.9893 11.4103 9.87496 11.4701 10.2113 10.4975H10.2113ZM5.77498 13.6484C6.4302 21.621 14.2618 18.4548 10.0133 12.418C8.6685 12.8614 7.48111 13.1437 5.77498 13.6484Z" fill="${
                                                  ColorSchemeEnum.PRIMARY
                                                }"></path></g><defs><clipPath id="clip0_8682_105578"><rect width="24" height="24" fill="white"></rect></clipPath></defs></svg>
                                                <div>${
                                                  decisionPointStep?.step?.[0]
                                                    ?.name || ''
                                                }</div>
                                            </div>
                                        `;
                              })
                              .join('')}
                            ${getValidArray(decisionPoint?.decisionPointMedias)
                              .map((decisionPointMedia) =>
                                getDecisionPointMediaDetail(
                                  decisionPointMedia?.media?.[0]
                                )
                              )
                              .join('')}
                        </div>
                    </div>
                `;
              })
              .join('')}              
      </div>`;
  }
  return '';
}
