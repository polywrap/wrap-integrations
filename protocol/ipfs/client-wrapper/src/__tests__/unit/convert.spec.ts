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

    expect(r).toStrictEqual(
      [
        {
          name: "file_0",
          value: "file_0_data",
          _type: "application/octet-stream",
          fileName: "file_0",
        },
        {
          name: "file_1",
          value: "file_1_data",
          _type: "application/octet-stream",
          fileName: "file_1",
        },
        {
          name: "dirA",
          value: null,
          _type: "application/x-directory",
          fileName: "dirA",
        },
        {
          name: "dirAA",
          value: null,
          _type: "application/x-directory",
          fileName: "dirAA",
        },
        {
          name: "file_AA_0",
          value: "file_AA_0_data",
          _type: "application/octet-stream",
          fileName: "dirA%2FdirAA%2Ffile_AA_0",
        },
        {
          name: "dirAAA",
          value: null,
          _type: "application/x-directory",
          fileName: "dirAAA",
        },
        {
          name: "dirAAAA",
          value: null,
          _type: "application/x-directory",
          fileName: "dirAAAA",
        },
        {
          name: "file_AAAA_0",
          value: "file_AAAA_0_data",
          _type: "application/octet-stream",
          fileName: "dirA%2FdirAA%2FdirAAA%2FdirAAAA%2Ffile_AAAA_0",
        },
        {
          name: "dirAB",
          value: null,
          _type: "application/x-directory",

          fileName: "dirAB",
        },
        {
          name: "file_AB_0",
          value: "file_AB_0_data",
          _type: "application/octet-stream",
          fileName: "dirA%2FdirAB%2Ffile_AB_0",
        },
        {
          name: "dirABA",
          value: null,
          _type: "application/x-directory",
          fileName: "dirABA",
        },
        {
          name: "file_ABA_0",
          value: "file_ABA_0_data",
          _type: "application/octet-stream",
          fileName: "dirA%2FdirAB%2FdirABA%2Ffile_ABA_0",
        },
        {
          name: "file_ABA_1",
          value: "file_ABA_1_data",
          _type: "application/octet-stream",
          fileName: "dirA%2FdirAB%2FdirABA%2Ffile_ABA_1",
        }
      ]
    );
  });
});