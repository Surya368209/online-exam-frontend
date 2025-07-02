import React from 'react';

const DownloadCSVButton = ({ results }) => {
  const handleDownload = () => {
    if (!results || results.length === 0) return;

    const headers = [
      "Roll No",
      "Name",
      "Department",
      "Year",
      "Score",
      "Percentage",
      "Submitted At",
      "Time Taken (mins)"
    ];

    const csvRows = [
      headers.join(","), // header row
      ...results.map((res) => {
        const submittedAt = res.submittedAt
          ? new Date(res.submittedAt).toLocaleString()
          : "";
        return [
          res.rollNo || "",
          res.studentName || "",
          res.department || "",
          res.year || "",
          res.totalScore ?? 0,
          (res.percentage ?? 0).toFixed(2) + "%",
          `"${submittedAt}"`, // wrap in quotes to protect commas
          res.timeTakenMinutes ?? 0
        ].join(",");
      })
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "exam_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload} style={{ marginTop: "20px" }}>
      Download Results as CSV
    </button>
  );
};

export default DownloadCSVButton;
