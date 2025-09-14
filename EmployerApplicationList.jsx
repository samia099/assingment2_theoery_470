import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployerApplicationList() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // === Helper function: Nested loop + 3 branches (≥15 lines) ===
  function buildHiringReport(jobs, appsByJob) {
    const report = [];  // final results

    for (let i = 0; i < jobs.length; i++) { // Outer loop
      const job = jobs[i];
      const apps = appsByJob[job._id] || [];
      let hired = 0, rejected = 0, other = 0;

      for (let k = 0; k < apps.length; k++) { // Inner loop
        const s = (apps[k].status || "").toLowerCase();

        if (s === "hired") {           // Branch 1
          hired++;
        } else if (s === "rejected") { // Branch 2
          rejected++;
        } else {                       // Branch 3
          other++;
        }
      }

      report.push({
        jobId: job._id,
        title: job.title || "Untitled",
        totals: {
          hired,
          rejected,
          other,
          total: hired + rejected + other,
        },
      });
    }
    return report;
  }

  // fetch employer jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("/api/jobs/employer");
        setJobs(res.data.jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  // fetch applications for selected job
  useEffect(() => {
    if (selectedJob) {
      const fetchApplications = async () => {
        try {
          const res = await axios.get(`/api/applications/job/${selectedJob._id}`);
          setApplications(res.data.applications);
        } catch (err) {
          console.error("Error fetching applications:", err);
        }
      };
      fetchApplications();
    }
  }, [selectedJob]);

  // Example: Build summary report whenever jobs/applications change
  const appsByJob = jobs.reduce((acc, job) => {
    acc[job._id] = applications.filter((a) => a.job === job._id);
    return acc;
  }, {});
  const hiringSummary = buildHiringReport(jobs, appsByJob);

  return (
    <div>
      <h2>Employer Applications</h2>

      {/* Job list */}
      <ul>
        {jobs.map((job) => (
          <li key={job._id} onClick={() => setSelectedJob(job)}>
            {job.title}
          </li>
        ))}
      </ul>

      {/* Applications */}
      {selectedJob && (
        <div>
          <h3>Applications for {selectedJob.title}</h3>
          <ul>
            {applications
              .filter((a) => statusFilter === "all" || a.status === statusFilter)
              .map((app) => (
                <li key={app._id}>
                  {app.applicantName} - {app.status}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Hiring Summary Output */}
      <div>
        <h3>Hiring Summary</h3>
        <ul>
          {hiringSummary.map((summary) => (
            <li key={summary.jobId}>
              <strong>{summary.title}</strong>: Hired {summary.totals.hired}, 
              Rejected {summary.totals.rejected}, Other {summary.totals.other}, 
              Total {summary.totals.total}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EmployerApplicationList;
