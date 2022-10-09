import {
  convertDirectoryBlobToFormData
} from "../../utils";

describe('Convert functions tests', () => {

  test("convertDirectoryBlobToFormData", () => {
    const r = convertDirectoryBlobToFormData({
      directories: [
        {
          name: "dirA",
          files: [],
          directories: [
            {
              name: "dirAA",
              directories: [
                {
                  name: "dirAAA",
                  directories: [
                    {
                      name: "dirAAAA",
                      directories: [],
                      files: [
                        {
                          data: String.UTF8.encode("file_AAAA_0_data"),
                          name: "file_AAAA_0"
                        },
                      ]
                    }
                  ],
                  files: []
                }
              ],
              files: [
                {
                  data: String.UTF8.encode("file_AA_0_data"),
                  name: "file_AA_0"
                }
              ]
            },
            {
              name: "dirAB",
              directories: [
                {
                  name: "dirABA",
                  directories: [],
                  files: [
                    {
                      data: String.UTF8.encode("file_ABA_0_data"),
                      name: "file_ABA_0"
                    },
                    {
                      data: String.UTF8.encode("file_ABA_1_data"),
                      name: "file_ABA_1"
                    }
                  ]
                }
              ],
              files: [
                {
                  data: String.UTF8.encode("file_AB_0_data"),
                  name: "file_AB_0"
                }
              ]
            }
          ]
        }],
      files: [
        {
          data: String.UTF8.encode("file_0_data"),
          name: "file_0"
        },
        {
          data: String.UTF8.encode("file_1_data"),
          name: "file_1"
        }
      ]
    })

    expect(r).toStrictEqual([
        {
          name: "file_0",
          value: "file_0_data",
          fileName: "file_0",
          _type: "application/octet-stream"
        },
        {
          name: "file_1",
          value: "file_1_data",
          fileName: "file_1",
          _type: "application/octet-stream"
        },
        {
          name: "dirA",
          value: null,
          fileName: "dirA",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAA",
          value: null,
          fileName: "dirA%2FdirAA",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAA/file_AA_0",
          value: "file_AA_0_data",
          fileName: "dirA%2FdirAA%2Ffile_AA_0",
          _type: "application/octet-stream"
        },
        {
          name: "dirA/dirAA/dirAAA",
          value: null,
          fileName: "dirA%2FdirAA%2FdirAAA",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAA/dirAAA/dirAAAA",
          value: null,
          fileName: "dirA%2FdirAA%2FdirAAA%2FdirAAAA",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAA/dirAAA/dirAAAA/file_AAAA_0",
          value: "file_AAAA_0_data",
          fileName: "dirA%2FdirAA%2FdirAAA%2FdirAAAA%2Ffile_AAAA_0",
          _type: "application/octet-stream"
        },
        {
          name: "dirA/dirAB",
          value: null,
          fileName: "dirA%2FdirAB",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAB/file_AB_0",
          value: "file_AB_0_data",
          fileName: "dirA%2FdirAB%2Ffile_AB_0",
          _type: "application/octet-stream"
        },
        {
          name: "dirA/dirAB/dirABA",
          value: null,
          fileName: "dirA%2FdirAB%2FdirABA",
          _type: "application/x-directory"
        },
        {
          name: "dirA/dirAB/dirABA/file_ABA_0",
          value: "file_ABA_0_data",
          fileName: "dirA%2FdirAB%2FdirABA%2Ffile_ABA_0",
          _type: "application/octet-stream"
        },
        {
          name: "dirA/dirAB/dirABA/file_ABA_1",
          value: "file_ABA_1_data",
          fileName: "dirA%2FdirAB%2FdirABA%2Ffile_ABA_1",
          _type: "application/octet-stream"
        }
      ]
    );
  });
});