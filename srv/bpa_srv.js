const cds = require('@sap/cds');
const axios = require('axios');

module.exports = (srv) => {
  srv.on("CREATE", "BPA", async (req) => {
    const { salesorderid, salesOrderValue, currency } = req.data;
    console.log(req.user.clientId)
    // Basic validation
    if (!salesorderid || !currency || !salesOrderValue) {
      req.error(400, "All fields are required.");
      return;
    }

    try {
      // Insert into DB using transaction
      const tx = cds.transaction(req);
      console.log(req.user)
      await tx.run(
        INSERT.into('DB_BPA').entries(req.data)
      );

      // Try to trigger workflow (but don't fail if it doesn't work)
      try {
        const accessToken = await getWorkflowToken();

        const result = await axios.post(
          "https://spa-api-gateway-bpi-us-prod.cfapps.us10.hana.ondemand.com/workflow/rest/v1/workflow-instances",
          {
            definitionId: "us10.14ca53d5trial.secondbpadan.mySecondProcessDan",
            context: {
              salesorderid,
              salesOrderValue,
              currency,
              startedBy:'deeb.deeba786@gmail.com'
            }
          },
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log("✅ Workflow started:", result.data);

      } catch (workflowError) {
        // Log workflow error but don't stop the DB insertion
        console.error("⚠️ Workflow not started:", workflowError.response?.data || workflowError.message);
      }

      // Always return success if DB insert succeeded
      return { salesorderid };

    } catch (err) {
      // Only fail if DB insert fails
      console.error("❌ Error inserting into DB:", err.message);
      req.error(500, "Database insert failed.");
    }
  });
};

// 🔐 Token fetcher for workflow API
const getWorkflowToken = async () => {
  const clientId = 'sb-90c660f7-c769-4827-bc6f-551c4cdd3418!b444086|xsuaa!b49390';
  const clientSecret = '532ce29a-b80d-45fa-a5ca-cf5e3e20ae1a$QgkNNPPn6HTmd4XIlnj11XtlutnVFgXsjnRt2olqrqY=';
  const tokenUrl = 'https://14ca53d5trial.authentication.us10.hana.ondemand.com/oauth/token';

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      tokenUrl,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Failed to get workflow token:', err.response?.data || err.message);
    throw new Error('Token generation failed');
  }
};
